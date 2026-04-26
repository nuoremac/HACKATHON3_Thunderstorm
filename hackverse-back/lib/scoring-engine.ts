import { assumptionRiskPenalty, buildAssumptions } from "@/lib/assumption-engine";
import { computeConfidence } from "@/lib/confidence-engine";
import { clamp } from "@/lib/http";
import type {
  Association,
  CandidateContext,
  Event,
  HelpRequest,
  RecommendationOutput,
  RecommendationType,
  ScoreBreakdown,
  Student
} from "@/lib/types";
import { buildExplanation } from "@/lib/explanation-engine";

const WEIGHTS = {
  InterestScore: 0.25,
  SkillScore: 0.2,
  AvailabilityScore: 0.2,
  AcademicContextScore: 0.1,
  LocationScore: 0.1,
  SocialProofScore: 0.05,
  FreshnessScore: 0.03,
  SourceReliabilityScore: 0.05,
  ExplorationScore: 0.02
} as const;

function normalizedSet(values: string[]) {
  return new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function jaccardScore(left: string[], right: string[]) {
  const a = normalizedSet(left);
  const b = normalizedSet(right);
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let common = 0;
  for (const item of a) {
    if (b.has(item)) common += 1;
  }
  return common / union.size;
}

function skillScore(student: Student, targetType: RecommendationType, target: Student | Association | Event | HelpRequest) {
  const offered = normalizedSet(student.skills_offered);
  const needed = normalizedSet(student.skills_needed);

  if (targetType === "student") {
    const peer = target as Student;
    const peerNeeds = normalizedSet(peer.skills_needed);
    const overlap = [...offered].find((skill) => peerNeeds.has(skill));
    if (overlap) return 1;
    const secondary = [...needed].find((skill) => normalizedSet(peer.skills_offered).has(skill));
    return secondary ? 0.7 : 0.3 * Number(student.department === peer.department);
  }

  if (targetType === "help_opportunity") {
    const helpRequest = target as HelpRequest;
    if (offered.has(helpRequest.skill.toLowerCase())) return 1;
    if (student.department && helpRequest.skill.toLowerCase().includes(student.department.toLowerCase())) return 0.3;
    return 0;
  }

  if (targetType === "association") {
    const association = target as Association;
    return jaccardScore(student.skills_offered, association.recruitment_needs);
  }

  return jaccardScore(student.skills_offered, (target as Event).tags);
}

function availabilityScore(context: CandidateContext) {
  const { student, targetType, target, timetableSlots } = context;
  const windows = [...student.availability];

  if (!windows.length && !timetableSlots.length) return 0.35;

  if (targetType === "event") {
    const event = target as Event;
    const start = new Date(event.start_time).getTime();
    const end = new Date(event.end_time).getTime();
    const requiredMinutes = Math.max(30, Math.round((end - start) / 60000));
    if (!windows.length) {
      const clashes = timetableSlots.some((slot) => {
        const slotStart = new Date(slot.start_time).getTime();
        const slotEnd = new Date(slot.end_time).getTime();
        return Math.max(slotStart, start) < Math.min(slotEnd, end);
      });
      return clashes ? 0.2 : 0.7;
    }
    const overlapMinutes = windows.reduce((best, window) => {
      const windowStart = new Date(window.start).getTime();
      const windowEnd = new Date(window.end).getTime();
      const overlap = Math.max(0, Math.min(windowEnd, end) - Math.max(windowStart, start));
      return Math.max(best, Math.round(overlap / 60000));
    }, 0);

    let score = clamp(overlapMinutes / requiredMinutes);

    // TWIST 04: Commuter Priority (Navetteurs)
    // If student is a commuter and the event is longer than 60 mins, 
    // we penalize it because they only stay 35-50 mins between classes.
    if (student.is_commuter && requiredMinutes > 60) {
      score *= 0.6; // High penalty for long events for commuters
    }
    
    // Conversely, if the event or help match is "Flash" (<= 45 mins), we boost it for commuters
    if (student.is_commuter && requiredMinutes <= 45 && overlapMinutes >= requiredMinutes) {
      score = 1.0; // Perfect match for a commuter's break
    }

    return score;
  }

  if (targetType === "help_opportunity") {
    const request = target as HelpRequest;
    if (request.scheduled_start && request.scheduled_end) {
      const start = new Date(request.scheduled_start).getTime();
      const end = new Date(request.scheduled_end).getTime();
      const requiredMinutes = Math.max(30, Math.round((end - start) / 60000));
      if (!windows.length) {
        const clashes = timetableSlots.some((slot) => {
          const slotStart = new Date(slot.start_time).getTime();
          const slotEnd = new Date(slot.end_time).getTime();
          return Math.max(slotStart, start) < Math.min(slotEnd, end);
        });
        return clashes ? 0.2 : 0.7;
      }
      const overlapMinutes = windows.reduce((best, window) => {
        const windowStart = new Date(window.start).getTime();
        const windowEnd = new Date(window.end).getTime();
        const overlap = Math.max(0, Math.min(windowEnd, end) - Math.max(windowStart, start));
        return Math.max(best, Math.round(overlap / 60000));
      }, 0);
      return clamp(overlapMinutes / requiredMinutes);
    }
    return 0.7;
  }

  return 0.6;
}

function academicContextScore(student: Student, targetType: RecommendationType, target: Student | Association | Event | HelpRequest) {
  const department = student.department?.toLowerCase() ?? "";
  if (targetType === "student") {
    const peer = target as Student;
    if (student.department === peer.department && student.academic_year === peer.academic_year) return 1;
    if (student.department === peer.department) return 0.8;
    if (student.department && peer.department && student.department[0] === peer.department[0]) return 0.6;
    if (jaccardScore(student.interests, peer.interests) > 0) return 0.4;
    return 0;
  }

  if (targetType === "association") {
    const association = target as Association;
    if (department && association.tags.some((tag) => tag.toLowerCase() === department)) return 0.8;
    return jaccardScore(student.interests, association.tags) > 0 ? 0.4 : 0.2;
  }

  if (targetType === "event") {
    const event = target as Event;
    if (department && event.tags.some((tag) => tag.toLowerCase() === department)) return 0.8;
    return jaccardScore(student.interests, event.tags) > 0 ? 0.4 : 0.1;
  }

  return 0.6;
}

function locationScore(context: CandidateContext) {
  const { student, targetType, target, timetableSlots } = context;
  const knownLocations = [
    ...student.availability.map((item) => item.location).filter(Boolean),
    ...timetableSlots.map((slot) => slot.location).filter(Boolean)
  ] as string[];

  const targetLocation =
    targetType === "event"
      ? (target as Event).location
      : targetType === "student"
        ? undefined
        : undefined;

  if (!targetLocation) return 0.2;
  if (knownLocations.some((location) => location === targetLocation)) return 1;
  if (knownLocations.some((location) => location.split(" ")[0] === targetLocation.split(" ")[0])) return 0.7;
  if (knownLocations.length) return 0.4;
  return 0.2;
}

function socialProofScore(context: CandidateContext) {
  const { feedback, targetType, target, impactRecords } = context;
  if (targetType === "student") {
    const targetStudent = target as Student;
    const targetFeedback = feedback.filter((item) => item.to_student_id === targetStudent.id);
    if (!targetFeedback.length) return 0.5;
    return clamp(targetFeedback.filter((item) => item.rating >= 4).length / targetFeedback.length);
  }

  if (targetType === "help_opportunity") {
    const request = target as HelpRequest;
    const helperRecords = impactRecords.filter((record) => record.student_id === request.helper_id);
    if (!helperRecords.length) return 0.5;
    const totalPositive = helperRecords.reduce((sum, item) => sum + item.positive_feedback_count, 0);
    const totalHelped = helperRecords.reduce((sum, item) => sum + item.helped_count, 0);
    return totalHelped ? clamp(totalPositive / totalHelped) : 0.5;
  }

  return 0.5;
}

function freshnessScore(lastUpdatedValues: string[]) {
  if (!lastUpdatedValues.length) return 0.1;
  const latest = Math.max(...lastUpdatedValues.map((item) => new Date(item).getTime()));
  const ageDays = (Date.now() - latest) / (1000 * 60 * 60 * 24);
  if (ageDays < 7) return 1;
  if (ageDays < 30) return 0.7;
  if (ageDays < 90) return 0.4;
  return 0.1;
}

function sourceReliabilityScore(sourceTypes: string[], explicitScores: number[]) {
  if (explicitScores.length) {
    return clamp(explicitScores.reduce((sum, score) => sum + score, 0) / explicitScores.length);
  }

  const normalized = sourceTypes.map((item) => item.toLowerCase());
  if (normalized.some((item) => item.includes("official") || item.includes("admin"))) return 1;
  if (normalized.some((item) => item.includes("timetable"))) return 0.8;
  if (normalized.some((item) => item.includes("student"))) return 0.7;
  if (normalized.some((item) => item.includes("inferred"))) return 0.5;
  return 0.2;
}

function explorationScore(student: Student, targetType: RecommendationType, target: Student | Association | Event | HelpRequest) {
  const interests = normalizedSet(student.interests);
  const department = student.department?.toLowerCase() ?? "";
  const targetTags =
    targetType === "student"
      ? [...(target as Student).interests, ...(target as Student).skills_offered]
      : targetType === "association"
        ? (target as Association).tags
        : targetType === "event"
          ? (target as Event).tags
          : [(target as HelpRequest).skill];

  const overlap = [...normalizedSet(targetTags)].filter((tag) => interests.has(tag)).length;
  if (overlap > 0 && normalizedSet(targetTags).size > overlap) return 1;
  if (department && targetTags.some((tag) => tag.toLowerCase().includes(department))) return 0.7;
  if (targetTags.length > 0) return 0.5;
  return 0.1;
}

function missingDataPenalty(student: Student) {
  const importantFields = [
    Boolean(student.department),
    Boolean(student.academic_year),
    student.interests.length > 0,
    student.skills_offered.length > 0 || student.skills_needed.length > 0,
    student.availability.length > 0,
    student.profile_completeness > 0
  ];
  const missing = importantFields.filter((item) => !item).length;
  return (missing / importantFields.length) * 0.15;
}

function conflictPenalty(context: CandidateContext) {
  const { student, sources, targetType, target, timetableSlots } = context;
  let penalty = 0;

  if (targetType === "event") {
    const event = target as Event;
    if (event.verification_status !== "verified") penalty += 0.15; // Increased penalty for Twist 05
    
    // TWIST 05: Obsolescence detection
    // If the event was updated more than 30 days ago, it might be obsolete
    if (event.updated_at) {
      const ageInDays = (Date.now() - new Date(event.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays > 30) penalty += 0.2; // Significant penalty for potentially outdated club data
    }
  }

  if (!sources.length) penalty += 0.05;

  if (student.availability.length && timetableSlots.length) {
    const hasConflict = timetableSlots.some((slot) => {
      const courseStart = new Date(slot.start_time).getTime();
      const courseEnd = new Date(slot.end_time).getTime();
      return student.availability.some((window) => {
        const start = new Date(window.start).getTime();
        const end = new Date(window.end).getTime();
        return Math.max(start, courseStart) < Math.min(end, courseEnd);
      });
    });
    if (hasConflict) penalty += 0.1;
  }

  return clamp(penalty, 0, 0.2);
}

function recommendationTypeForTarget(targetType: RecommendationType) {
  if (targetType === "student") return "student_connection";
  if (targetType === "association") return "association_discovery";
  if (targetType === "event") return "event_attendance";
  return "help_match";
}

export function buildRecommendation(context: CandidateContext): RecommendationOutput {
  const { student, targetType, target, sources, relevantSignals } = context;

  const interestComparable =
    targetType === "student"
      ? (target as Student).interests
      : targetType === "association"
        ? (target as Association).tags
        : targetType === "event"
          ? (target as Event).tags
          : [(target as HelpRequest).skill];

  const assumptions = buildAssumptions(context);
  const assumptionRisk = assumptionRiskPenalty(assumptions);
  const freshness = freshnessScore([
    ...sources.map((item) => item.last_updated),
    ...(target as { updated_at?: string }).updated_at ? [(target as { updated_at?: string }).updated_at as string] : [],
    ...(student.updated_at ? [student.updated_at] : [])
  ]);
  const reliability = sourceReliabilityScore(
    [...sources.map((item) => item.source_type), ...relevantSignals.map((item) => item.source)],
    sources.map((item) => item.reliability_score)
  );
  const conflict = conflictPenalty(context);
  const breakdown: ScoreBreakdown = {
    InterestScore: jaccardScore(student.interests, interestComparable),
    SkillScore: skillScore(student, targetType, target),
    AvailabilityScore: availabilityScore(context),
    AcademicContextScore: academicContextScore(student, targetType, target),
    LocationScore: locationScore(context),
    SocialProofScore: socialProofScore(context),
    FreshnessScore: freshness,
    SourceReliabilityScore: reliability,
    ExplorationScore: explorationScore(student, targetType, target),
    MissingDataPenalty: missingDataPenalty(student),
    ConflictPenalty: conflict,
    AssumptionRiskPenalty: assumptionRisk,
    finalScore: 0
  };

  const signalContributions = Object.entries(WEIGHTS).map(([key, weight]) => {
    const raw = breakdown[key as keyof typeof WEIGHTS];
    return Math.min(raw * weight, 0.35);
  });

  const positiveScore = signalContributions.reduce((sum, value) => sum + value, 0);
  const finalScore = clamp(
    positiveScore -
      breakdown.MissingDataPenalty -
      breakdown.ConflictPenalty -
      breakdown.AssumptionRiskPenalty
  );
  breakdown.finalScore = finalScore;

  const confidence = computeConfidence({
    sourceReliabilityScore: reliability,
    profileCompleteness: student.profile_completeness,
    freshnessScore: freshness,
    conflictPenalty: conflict,
    confidenceImpactFromAssumptions: assumptions.reduce(
      (sum, item) => sum + item.confidence_impact,
      0
    )
  });

  const explanation = buildExplanation(
    context,
    breakdown,
    assumptions.map((item) => item.assumption)
  );

  return {
    targetType,
    targetId: (target as { id: string }).id,
    recommendationType: recommendationTypeForTarget(targetType),
    score: finalScore,
    confidence,
    explanation,
    assumptions,
    scoreBreakdown: breakdown,
    target
  };
}
