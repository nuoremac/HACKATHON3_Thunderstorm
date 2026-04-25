import {
  getStudentById,
  listAssociations,
  listDataSources,
  listEvents,
  listFeedback,
  listHelpRequests,
  listImpactRecords,
  listSignals,
  listStudents,
  listTimetableSlots,
  replaceRecommendations
} from "@/lib/db";
import { buildRecommendation } from "@/lib/scoring-engine";
import type {
  Association,
  CandidateContext,
  Event,
  HelpRequest,
  RecommendationOutput,
  RecommendationType,
  Student
} from "@/lib/types";

function isActiveSignal(expiresAt?: string | null) {
  return !expiresAt || new Date(expiresAt) > new Date();
}

function isNewStudentMode(student: Student) {
  if (student.profile_completeness < 0.5) return true;
  if (!student.created_at) return false;
  const ageDays = (Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= 14;
}

function mixForNewStudentMode(recommendations: RecommendationOutput[]) {
  const buckets = new Map<RecommendationType, RecommendationOutput[]>();
  recommendations.forEach((item) => {
    const bucket = buckets.get(item.targetType) ?? [];
    bucket.push(item);
    buckets.set(item.targetType, bucket);
  });

  const orderedTypes: RecommendationType[] = ["event", "association", "student", "help_opportunity"];
  const frontloaded: RecommendationOutput[] = [];

  orderedTypes.forEach((type) => {
    const bucket = buckets.get(type);
    if (bucket?.length) {
      frontloaded.push(bucket.shift() as RecommendationOutput);
    }
  });

  const remainder = orderedTypes.flatMap((type) => buckets.get(type) ?? []);
  return [...frontloaded, ...remainder];
}

function buildContext<T extends Student | Association | Event | HelpRequest>(
  student: Student,
  targetType: RecommendationType,
  target: T,
  bag: {
    feedback: Awaited<ReturnType<typeof listFeedback>>;
    impactRecords: Awaited<ReturnType<typeof listImpactRecords>>;
    signals: Awaited<ReturnType<typeof listSignals>>;
    timetableSlots: Awaited<ReturnType<typeof listTimetableSlots>>;
    dataSources: Awaited<ReturnType<typeof listDataSources>>;
  }
): CandidateContext {
  return {
    student,
    targetType,
    target,
    feedback: bag.feedback,
    impactRecords: bag.impactRecords,
    relevantSignals: bag.signals.filter(
      (signal) => signal.student_id === student.id && isActiveSignal(signal.expires_at)
    ),
    timetableSlots: bag.timetableSlots.filter((slot) => slot.student_id === student.id),
    sources: bag.dataSources.filter(
      (source) => source.entity_id === (target as { id: string }).id && source.entity_type === targetType
    )
  };
}

export async function generateRecommendations(studentId: string) {
  const student = await getStudentById(studentId);
  if (!student) {
    return null;
  }

  const [students, associations, events, helpRequests, feedback, impactRecords, signals, timetableSlots, dataSources] =
    await Promise.all([
      listStudents(),
      listAssociations(),
      listEvents(),
      listHelpRequests(),
      listFeedback(),
      listImpactRecords(),
      listSignals(),
      listTimetableSlots(),
      listDataSources()
    ]);

  const outputs: RecommendationOutput[] = [];

  students
    .filter((candidate) => candidate.id !== student.id)
    .forEach((candidate) => {
      outputs.push(
        buildRecommendation(
          buildContext(student, "student", candidate, {
            feedback,
            impactRecords,
            signals,
            timetableSlots,
            dataSources
          })
        )
      );
    });

  associations.forEach((candidate) => {
    outputs.push(
      buildRecommendation(
        buildContext(student, "association", candidate, {
          feedback,
          impactRecords,
          signals,
          timetableSlots,
          dataSources
        })
      )
    );
  });

  events.forEach((candidate) => {
    outputs.push(
      buildRecommendation(
        buildContext(student, "event", candidate, {
          feedback,
          impactRecords,
          signals,
          timetableSlots,
          dataSources
        })
      )
    );
  });

  helpRequests
    .filter((candidate) => candidate.status === "open" && candidate.requester_id !== student.id)
    .forEach((candidate) => {
      outputs.push(
        buildRecommendation(
          buildContext(student, "help_opportunity", candidate, {
            feedback,
            impactRecords,
            signals,
            timetableSlots,
            dataSources
          })
        )
      );
    });

  const ranked = outputs.sort((left, right) => {
    if (right.score === left.score) return right.confidence - left.confidence;
    return right.score - left.score;
  });
  const finalRanked = isNewStudentMode(student) ? mixForNewStudentMode(ranked) : ranked;

  await replaceRecommendations(
    studentId,
    finalRanked.map((item) => ({
      student_id: studentId,
      target_type: item.targetType,
      target_id: item.targetId,
      score: item.score,
      confidence: item.confidence,
      recommendation_type: item.recommendationType,
      explanation: item.explanation
    })),
    finalRanked.map((item) =>
      item.assumptions.map((assumption) => ({
        assumption: assumption.assumption,
        source: assumption.source,
        confidence: assumption.confidence,
        risk_level: assumption.risk_level,
        confidence_impact: assumption.confidence_impact,
        is_user_confirmed: assumption.is_user_confirmed
      }))
    )
  );

  return {
    student,
    generated_at: new Date().toISOString(),
    recommendations: finalRanked
  };
}
