import { listFeedbackByStudent, listHelpRequestsForStudent, listImpactRecords, upsertImpactRecords } from "@/lib/db";

export async function computeImpactProfile(studentId: string) {
  const [feedback, helpRequests, existingRecords] = await Promise.all([
    listFeedbackByStudent(studentId),
    listHelpRequestsForStudent(studentId),
    listImpactRecords(studentId)
  ]);

  const helpedRequests = helpRequests.filter(
    (request) => request.helper_id === studentId && request.status === "completed"
  );
  const positiveFeedback = feedback.filter(
    (item) => item.to_student_id === studentId && item.rating >= 4
  );

  const bySkill = new Map<
    string,
    { helped_count: number; positive_feedback_count: number; confidence_score: number }
  >();

  helpedRequests.forEach((request) => {
    const bucket = bySkill.get(request.skill) ?? {
      helped_count: 0,
      positive_feedback_count: 0,
      confidence_score: 0
    };
    bucket.helped_count += 1;
    bySkill.set(request.skill, bucket);
  });

  positiveFeedback.forEach((item) => {
    const skill = item.skill_confirmed ?? "general_support";
    const bucket = bySkill.get(skill) ?? {
      helped_count: 0,
      positive_feedback_count: 0,
      confidence_score: 0
    };
    bucket.positive_feedback_count += 1;
    bySkill.set(skill, bucket);
  });

  const records = [...bySkill.entries()].map(([skill, value]) => ({
    student_id: studentId,
    skill,
    helped_count: value.helped_count,
    positive_feedback_count: value.positive_feedback_count,
    confidence_score:
      value.helped_count === 0 ? 0 : value.positive_feedback_count / value.helped_count
  }));

  const persisted = records.length ? await upsertImpactRecords(records) : existingRecords;

  return {
    student_id: studentId,
    helped_count: helpedRequests.length,
    positive_feedback: positiveFeedback.length,
    skill_confidence_score:
      persisted.length === 0
        ? 0
        : persisted.reduce((sum, item) => sum + item.confidence_score, 0) / persisted.length,
    skills: persisted
  };
}
