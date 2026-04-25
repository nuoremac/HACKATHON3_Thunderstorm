import { PostgrestError } from "@supabase/supabase-js";
import { mapSupabaseError } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import type {
  Association,
  DataSource,
  Event,
  Feedback,
  HelpRequest,
  ImpactRecord,
  RecommendationAssumption,
  RecommendationRecord,
  Student,
  StudentSignal,
  TimetableSlot
} from "@/lib/types";

const STUDENT_COLUMNS =
  "id,name,email,department,academic_year,interests,skills_offered,skills_needed,availability,profile_links,privacy_level,profile_completeness,created_at";
const ASSOCIATION_COLUMNS =
  "id,name,description,tags,contact,recruitment_needs,created_at";
const EVENT_COLUMNS =
  "id,association_id,title,description,tags,start_time,end_time,location,capacity,source,verification_status,created_at";
const HELP_REQUEST_COLUMNS =
  "id,requester_id,helper_id,skill,message,status,created_at,completed_at";
const FEEDBACK_COLUMNS =
  "id,request_id,from_student_id,to_student_id,rating,comment,skill_confirmed,created_at";
const IMPACT_COLUMNS =
  "id,student_id,skill,helped_count,positive_feedback_count,confidence_score";
const SIGNAL_COLUMNS =
  "id,student_id,signal_type,value,source,confidence,created_at,expires_at";
const RECOMMENDATION_COLUMNS =
  "id,student_id,target_type,target_id,score,confidence,explanation,created_at";
const ASSUMPTION_COLUMNS =
  "id,recommendation_id,assumption,source,confidence,risk_level,is_user_confirmed";
const DATA_SOURCE_COLUMNS =
  "id,entity_type,entity_id,source_type,reliability_score,last_updated";
const TIMETABLE_COLUMNS =
  "id,student_id,course_name,start_time,end_time,location";

function throwMapped(error: PostgrestError | null, options: Parameters<typeof mapSupabaseError>[1]) {
  if (error) {
    mapSupabaseError(error, options);
  }
}

export async function listStudents() {
  const { data, error } = await supabase.from("students").select(STUDENT_COLUMNS).order("name");
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les etudiants",
    defaultCode: "STUDENT_LIST_FAILED"
  });
  return (data ?? []) as Student[];
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de recuperer l'etudiant",
    defaultCode: "STUDENT_FETCH_FAILED"
  });
  return (data as Student | null) ?? null;
}

export async function getStudentByEmail(email: string) {
  const { data, error } = await supabase
    .from("students")
    .select(STUDENT_COLUMNS)
    .eq("email", email)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de verifier l'email",
    defaultCode: "STUDENT_EMAIL_LOOKUP_FAILED"
  });
  return (data as Student | null) ?? null;
}

export async function createStudent(payload: Partial<Student>) {
  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select(STUDENT_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer l'etudiant",
    defaultCode: "STUDENT_CREATE_FAILED",
    unique: {
      message: "email deja utilise",
      code: "EMAIL_ALREADY_EXISTS"
    },
    notNull: {
      message: "champs etudiant manquants",
      code: "STUDENT_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees etudiant invalides",
      code: "INVALID_STUDENT_DATA"
    }
  });
  return data as Student;
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  const { data, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .select(STUDENT_COLUMNS)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de mettre a jour l'etudiant",
    defaultCode: "STUDENT_UPDATE_FAILED",
    unique: {
      message: "email deja utilise",
      code: "EMAIL_ALREADY_EXISTS"
    },
    notNull: {
      message: "mise a jour etudiant invalide",
      code: "INVALID_STUDENT_UPDATE"
    },
    invalidText: {
      message: "donnees etudiant invalides",
      code: "INVALID_STUDENT_DATA"
    }
  });
  return (data as Student | null) ?? null;
}

export async function listAssociations() {
  const { data, error } = await supabase
    .from("associations")
    .select(ASSOCIATION_COLUMNS)
    .order("name");
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les associations",
    defaultCode: "ASSOCIATION_LIST_FAILED"
  });
  return (data ?? []) as Association[];
}

export async function getAssociationById(id: string) {
  const { data, error } = await supabase
    .from("associations")
    .select(ASSOCIATION_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de recuperer l'association",
    defaultCode: "ASSOCIATION_FETCH_FAILED"
  });
  return (data as Association | null) ?? null;
}

export async function createAssociation(payload: Partial<Association>) {
  const { data, error } = await supabase
    .from("associations")
    .insert(payload)
    .select(ASSOCIATION_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer l'association",
    defaultCode: "ASSOCIATION_CREATE_FAILED",
    notNull: {
      message: "champs association manquants",
      code: "ASSOCIATION_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees association invalides",
      code: "INVALID_ASSOCIATION_DATA"
    }
  });
  return data as Association;
}

export async function listEvents() {
  const { data, error } = await supabase.from("events").select(EVENT_COLUMNS).order("start_time");
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les evenements",
    defaultCode: "EVENT_LIST_FAILED"
  });
  return (data ?? []) as Event[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de recuperer l'evenement",
    defaultCode: "EVENT_FETCH_FAILED"
  });
  return (data as Event | null) ?? null;
}

export async function createEvent(payload: Partial<Event>) {
  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select(EVENT_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer l'evenement",
    defaultCode: "EVENT_CREATE_FAILED",
    foreignKey: {
      message: "association inexistante",
      code: "ASSOCIATION_NOT_FOUND",
      status: 400
    },
    notNull: {
      message: "champs evenement manquants",
      code: "EVENT_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees evenement invalides",
      code: "INVALID_EVENT_DATA"
    }
  });
  return data as Event;
}

export async function listHelpRequestsForStudent(studentId: string) {
  const { data, error } = await supabase
    .from("help_requests")
    .select(HELP_REQUEST_COLUMNS)
    .or(`requester_id.eq.${studentId},helper_id.eq.${studentId}`)
    .order("created_at", { ascending: false });
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les demandes d'aide",
    defaultCode: "HELP_REQUEST_LIST_FAILED"
  });
  return (data ?? []) as HelpRequest[];
}

export async function listHelpRequests() {
  const { data, error } = await supabase
    .from("help_requests")
    .select(HELP_REQUEST_COLUMNS)
    .order("created_at", { ascending: false });
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les demandes d'aide",
    defaultCode: "HELP_REQUEST_LIST_FAILED"
  });
  return (data ?? []) as HelpRequest[];
}

export async function getHelpRequestById(id: string) {
  const { data, error } = await supabase
    .from("help_requests")
    .select(HELP_REQUEST_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de recuperer la demande d'aide",
    defaultCode: "HELP_REQUEST_FETCH_FAILED"
  });
  return (data as HelpRequest | null) ?? null;
}

export async function createHelpRequest(payload: Partial<HelpRequest>) {
  const { data, error } = await supabase
    .from("help_requests")
    .insert(payload)
    .select(HELP_REQUEST_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer la demande d'aide",
    defaultCode: "HELP_REQUEST_CREATE_FAILED",
    foreignKey: {
      message: "utilisateur inexistant",
      code: "STUDENT_NOT_FOUND",
      status: 400
    },
    notNull: {
      message: "champs demande d'aide manquants",
      code: "HELP_REQUEST_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees demande d'aide invalides",
      code: "INVALID_HELP_REQUEST_DATA"
    }
  });
  return data as HelpRequest;
}

export async function updateHelpRequest(id: string, payload: Partial<HelpRequest>) {
  const { data, error } = await supabase
    .from("help_requests")
    .update(payload)
    .eq("id", id)
    .select(HELP_REQUEST_COLUMNS)
    .maybeSingle();
  throwMapped(error, {
    defaultMessage: "impossible de mettre a jour la demande d'aide",
    defaultCode: "HELP_REQUEST_UPDATE_FAILED",
    foreignKey: {
      message: "utilisateur inexistant",
      code: "STUDENT_NOT_FOUND",
      status: 400
    },
    notNull: {
      message: "mise a jour demande d'aide invalide",
      code: "INVALID_HELP_REQUEST_UPDATE"
    },
    invalidText: {
      message: "donnees demande d'aide invalides",
      code: "INVALID_HELP_REQUEST_DATA"
    }
  });
  return (data as HelpRequest | null) ?? null;
}

export async function createFeedback(payload: Partial<Feedback>) {
  const { data, error } = await supabase
    .from("feedbacks")
    .insert(payload)
    .select(FEEDBACK_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer le feedback",
    defaultCode: "FEEDBACK_CREATE_FAILED",
    foreignKey: {
      message: "reference de feedback invalide",
      code: "FEEDBACK_REFERENCE_NOT_FOUND",
      status: 400
    },
    notNull: {
      message: "champs feedback manquants",
      code: "FEEDBACK_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees feedback invalides",
      code: "INVALID_FEEDBACK_DATA"
    }
  });
  return data as Feedback;
}

export async function listFeedbackByStudent(studentId: string) {
  const { data, error } = await supabase
    .from("feedbacks")
    .select(FEEDBACK_COLUMNS)
    .or(`from_student_id.eq.${studentId},to_student_id.eq.${studentId}`);
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les feedbacks",
    defaultCode: "FEEDBACK_LIST_FAILED"
  });
  return (data ?? []) as Feedback[];
}

export async function listFeedback() {
  const { data, error } = await supabase.from("feedbacks").select(FEEDBACK_COLUMNS);
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les feedbacks",
    defaultCode: "FEEDBACK_LIST_FAILED"
  });
  return (data ?? []) as Feedback[];
}

export async function upsertImpactRecords(records: Partial<ImpactRecord>[]) {
  if (!records.length) return [];

  const { data, error } = await supabase
    .from("impact_records")
    .upsert(records, { onConflict: "student_id,skill" })
    .select(IMPACT_COLUMNS);
  throwMapped(error, {
    defaultMessage: "impossible de mettre a jour l'impact",
    defaultCode: "IMPACT_UPSERT_FAILED",
    foreignKey: {
      message: "utilisateur inexistant",
      code: "STUDENT_NOT_FOUND",
      status: 400
    }
  });
  return (data ?? []) as ImpactRecord[];
}

export async function listImpactRecords(studentId?: string) {
  let query = supabase.from("impact_records").select(IMPACT_COLUMNS);
  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les scores d'impact",
    defaultCode: "IMPACT_LIST_FAILED"
  });
  return (data ?? []) as ImpactRecord[];
}

export async function createSignal(payload: Partial<StudentSignal>) {
  const { data, error } = await supabase
    .from("student_signals")
    .insert(payload)
    .select(SIGNAL_COLUMNS)
    .single();
  throwMapped(error, {
    defaultMessage: "impossible de creer le signal",
    defaultCode: "SIGNAL_CREATE_FAILED",
    foreignKey: {
      message: "utilisateur inexistant",
      code: "STUDENT_NOT_FOUND",
      status: 400
    },
    notNull: {
      message: "champs signal manquants",
      code: "SIGNAL_REQUIRED_FIELD_MISSING"
    },
    invalidText: {
      message: "donnees signal invalides",
      code: "INVALID_SIGNAL_DATA"
    }
  });
  return data as StudentSignal;
}

export async function listSignals(studentId?: string) {
  let query = supabase.from("student_signals").select(SIGNAL_COLUMNS);
  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les signaux",
    defaultCode: "SIGNAL_LIST_FAILED"
  });
  return (data ?? []) as StudentSignal[];
}

export async function listTimetableSlots(studentId?: string) {
  let query = supabase.from("timetable_slots").select(TIMETABLE_COLUMNS);
  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les emplois du temps",
    defaultCode: "TIMETABLE_LIST_FAILED"
  });
  return (data ?? []) as TimetableSlot[];
}

export async function listDataSources(entityType?: string, entityId?: string) {
  let query = supabase.from("data_sources").select(DATA_SOURCE_COLUMNS);
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);

  const { data, error } = await query;
  throwMapped(error, {
    defaultMessage: "impossible de recuperer les sources de donnees",
    defaultCode: "DATA_SOURCE_LIST_FAILED"
  });
  return (data ?? []) as DataSource[];
}

export async function replaceRecommendations(
  studentId: string,
  recommendations: Partial<RecommendationRecord>[],
  assumptionsByRecommendation: Partial<RecommendationAssumption>[][]
) {
  const cleared = await supabase.from("recommendations").delete().eq("student_id", studentId);
  throwMapped(cleared.error, {
    defaultMessage: "impossible de reinitialiser les recommandations",
    defaultCode: "RECOMMENDATION_CLEAR_FAILED"
  });

  if (!recommendations.length) {
    return [];
  }

  const inserted = await supabase
    .from("recommendations")
    .insert(recommendations)
    .select(RECOMMENDATION_COLUMNS);
  throwMapped(inserted.error, {
    defaultMessage: "impossible de creer les recommandations",
    defaultCode: "RECOMMENDATION_CREATE_FAILED",
    foreignKey: {
      message: "utilisateur inexistant",
      code: "STUDENT_NOT_FOUND",
      status: 400
    }
  });
  const recs = (inserted.data ?? []) as RecommendationRecord[];

  const mappedAssumptions = assumptionsByRecommendation.flatMap((assumptions, index) =>
    assumptions.map((assumption) => ({
      ...assumption,
      recommendation_id: assumption.recommendation_id ?? recs[index]?.id
    }))
  );

  if (mappedAssumptions.length) {
    const insertedAssumptions = await supabase
      .from("recommendation_assumptions")
      .insert(mappedAssumptions)
      .select(ASSUMPTION_COLUMNS);
    throwMapped(insertedAssumptions.error, {
      defaultMessage: "impossible d'enregistrer les hypotheses de recommandation",
      defaultCode: "RECOMMENDATION_ASSUMPTION_CREATE_FAILED"
    });
  }

  return recs;
}
