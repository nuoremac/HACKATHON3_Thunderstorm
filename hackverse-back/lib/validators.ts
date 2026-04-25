import {
  apiError,
  optionalDateString,
  optionalEnumValue,
  optionalInteger,
  optionalNonEmptyString,
  requireAvailability,
  requireDateString,
  requireEnumValue,
  requireNonEmptyString,
  requireNumberInRange,
  requireProfileLinks,
  requireStringArray,
  validateEmail,
  validateUUID
} from "@/lib/http";
import type {
  Association,
  Event,
  Feedback,
  HelpRequest,
  HelpRequestStatus,
  PrivacyLevel,
  Student,
  StudentSignal,
  VerificationStatus
} from "@/lib/types";

const PRIVACY_LEVELS = ["public", "campus", "private"] as const satisfies readonly PrivacyLevel[];
const VERIFICATION_STATUSES =
  ["verified", "pending", "unverified"] as const satisfies readonly VerificationStatus[];
const HELP_REQUEST_STATUSES =
  ["open", "accepted", "rejected", "completed", "rescheduled"] as const satisfies readonly HelpRequestStatus[];

function rejectUnknownKeys(
  payload: Record<string, unknown>,
  allowedKeys: readonly string[],
  code = "UNKNOWN_FIELD"
) {
  const unknownKeys = Object.keys(payload).filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length) {
    throw apiError(400, "champ non autorise", code, { unknownKeys });
  }
}

export function sanitizeStudentPayload(
  payload: Record<string, unknown>,
  mode: "create" | "update"
): Partial<Student> {
  rejectUnknownKeys(payload, [
    "name",
    "email",
    "department",
    "academic_year",
    "interests",
    "skills_offered",
    "skills_needed",
    "availability",
    "profile_links",
    "privacy_level",
    "profile_completeness"
  ]);

  const sanitized: Partial<Student> = {};

  if (mode === "create" || "name" in payload) {
    sanitized.name = requireNonEmptyString(payload.name, "name");
  }
  if (mode === "create" || "email" in payload) {
    const email = requireNonEmptyString(payload.email, "email").toLowerCase();
    if (!validateEmail(email)) {
      throw apiError(400, "email invalide", "INVALID_EMAIL");
    }
    sanitized.email = email;
  }
  if (mode === "create" || "department" in payload) {
    sanitized.department = requireNonEmptyString(payload.department, "department");
  }
  if (mode === "create" || "academic_year" in payload) {
    sanitized.academic_year = requireNonEmptyString(payload.academic_year, "academic_year");
  }

  if (mode === "create" || "interests" in payload) {
    sanitized.interests = requireStringArray(payload.interests, "interests");
  }
  if (mode === "create" || "skills_offered" in payload) {
    sanitized.skills_offered = requireStringArray(payload.skills_offered, "skills_offered");
  }
  if (mode === "create" || "skills_needed" in payload) {
    sanitized.skills_needed = requireStringArray(payload.skills_needed, "skills_needed");
  }
  if (mode === "create" || "availability" in payload) {
    sanitized.availability = requireAvailability(payload.availability);
  }
  if (mode === "create" || "profile_links" in payload) {
    sanitized.profile_links = requireProfileLinks(payload.profile_links);
  }
  if ("privacy_level" in payload) {
    sanitized.privacy_level = requireEnumValue(payload.privacy_level, "privacy_level", PRIVACY_LEVELS);
  } else if (mode === "create") {
    sanitized.privacy_level = "campus";
  }
  if ("profile_completeness" in payload) {
    sanitized.profile_completeness = requireNumberInRange(
      payload.profile_completeness,
      "profile_completeness",
      0,
      1
    );
  } else if (mode === "create") {
    sanitized.profile_completeness = 0;
  }

  return sanitized;
}

export function sanitizeAssociationPayload(
  payload: Record<string, unknown>
): Partial<Association> {
  rejectUnknownKeys(payload, ["name", "description", "tags", "contact", "recruitment_needs"]);

  return {
    name: requireNonEmptyString(payload.name, "name"),
    description: requireNonEmptyString(payload.description, "description"),
    tags: requireStringArray(payload.tags, "tags"),
    contact:
      payload.contact === undefined ? null : optionalNonEmptyString(payload.contact, "contact"),
    recruitment_needs: requireStringArray(payload.recruitment_needs, "recruitment_needs")
  };
}

export function sanitizeEventPayload(payload: Record<string, unknown>): Partial<Event> {
  rejectUnknownKeys(payload, [
    "association_id",
    "title",
    "description",
    "tags",
    "start_time",
    "end_time",
    "location",
    "capacity",
    "source",
    "verification_status"
  ]);

  const associationId = requireNonEmptyString(payload.association_id, "association_id");
  if (!validateUUID(associationId)) {
    throw apiError(400, "association_id invalide", "INVALID_ASSOCIATION_ID");
  }

  const startTime = requireDateString(payload.start_time, "start_time");
  const endTime = requireDateString(payload.end_time, "end_time");
  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    throw apiError(422, "dates d'evenement invalides", "INVALID_EVENT_TIME_RANGE");
  }

  return {
    association_id: associationId,
    title: requireNonEmptyString(payload.title, "title"),
    description:
      payload.description === undefined ? "" : requireNonEmptyString(payload.description, "description"),
    tags: requireStringArray(payload.tags, "tags"),
    start_time: startTime,
    end_time: endTime,
    location: payload.location === undefined ? "" : requireNonEmptyString(payload.location, "location"),
    capacity: optionalInteger(payload.capacity, "capacity", 1) ?? null,
    source: payload.source === undefined ? "unknown_source" : requireNonEmptyString(payload.source, "source"),
    verification_status:
      optionalEnumValue(payload.verification_status, "verification_status", VERIFICATION_STATUSES) ??
      "pending"
  };
}

export function sanitizeHelpRequestPayload(
  payload: Record<string, unknown>,
  mode: "create" | "update"
): Partial<HelpRequest> {
  rejectUnknownKeys(payload, [
    "requester_id",
    "helper_id",
    "skill",
    "message",
    "status",
    "completed_at"
  ]);

  const sanitized: Partial<HelpRequest> = {};

  if (mode === "create" || "requester_id" in payload) {
    const requesterId = requireNonEmptyString(payload.requester_id, "requester_id");
    if (!validateUUID(requesterId)) {
      throw apiError(400, "requester_id invalide", "INVALID_REQUESTER_ID");
    }
    sanitized.requester_id = requesterId;
  }

  if ("helper_id" in payload) {
    if (payload.helper_id === null) {
      sanitized.helper_id = null;
    } else {
      const helperId = requireNonEmptyString(payload.helper_id, "helper_id");
      if (!validateUUID(helperId)) {
        throw apiError(400, "helper_id invalide", "INVALID_HELPER_ID");
      }
      sanitized.helper_id = helperId;
    }
  }

  if (mode === "create" || "skill" in payload) {
    sanitized.skill = requireNonEmptyString(payload.skill, "skill");
  }
  if (mode === "create" || "message" in payload) {
    sanitized.message = requireNonEmptyString(payload.message, "message");
  }
  if ("status" in payload) {
    sanitized.status = requireEnumValue(payload.status, "status", HELP_REQUEST_STATUSES);
  } else if (mode === "create") {
    sanitized.status = "open";
  }
  if ("completed_at" in payload) {
    sanitized.completed_at = optionalDateString(payload.completed_at, "completed_at");
  }

  return sanitized;
}

export function sanitizeFeedbackPayload(payload: Record<string, unknown>): Partial<Feedback> {
  rejectUnknownKeys(payload, [
    "request_id",
    "from_student_id",
    "to_student_id",
    "rating",
    "comment",
    "skill_confirmed"
  ]);

  const requestId = requireNonEmptyString(payload.request_id, "request_id");
  const fromStudentId = requireNonEmptyString(payload.from_student_id, "from_student_id");
  const toStudentId = requireNonEmptyString(payload.to_student_id, "to_student_id");

  if (!validateUUID(requestId)) {
    throw apiError(400, "request_id invalide", "INVALID_REQUEST_ID");
  }
  if (!validateUUID(fromStudentId)) {
    throw apiError(400, "from_student_id invalide", "INVALID_FROM_STUDENT_ID");
  }
  if (!validateUUID(toStudentId)) {
    throw apiError(400, "to_student_id invalide", "INVALID_TO_STUDENT_ID");
  }

  const rating = payload.rating;
  if (typeof rating !== "number" || Number.isNaN(rating) || !Number.isInteger(rating)) {
    throw apiError(400, "note invalide", "INVALID_RATING");
  }
  if (rating < 1 || rating > 5) {
    throw apiError(422, "note invalide", "INVALID_RATING");
  }

  return {
    request_id: requestId,
    from_student_id: fromStudentId,
    to_student_id: toStudentId,
    rating,
    comment:
      payload.comment === undefined ? null : optionalNonEmptyString(payload.comment, "comment"),
    skill_confirmed:
      payload.skill_confirmed === undefined
        ? null
        : optionalNonEmptyString(payload.skill_confirmed, "skill_confirmed")
  };
}

export function sanitizeSignalPayload(payload: Record<string, unknown>): Partial<StudentSignal> {
  rejectUnknownKeys(payload, [
    "student_id",
    "signal_type",
    "value",
    "source",
    "confidence",
    "expires_at"
  ]);

  const studentId = requireNonEmptyString(payload.student_id, "student_id");
  if (!validateUUID(studentId)) {
    throw apiError(400, "student_id invalide", "INVALID_STUDENT_ID");
  }

  return {
    student_id: studentId,
    signal_type: requireNonEmptyString(payload.signal_type, "signal_type"),
    value: requireNonEmptyString(payload.value, "value"),
    source: requireNonEmptyString(payload.source, "source"),
    confidence:
      payload.confidence === undefined
        ? 0.5
        : requireNumberInRange(payload.confidence, "confidence", 0, 1),
    expires_at:
      payload.expires_at === undefined ? null : optionalDateString(payload.expires_at, "expires_at")
  };
}
