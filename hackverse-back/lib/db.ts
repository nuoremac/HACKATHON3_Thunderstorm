import { PostgrestError } from "@supabase/supabase-js";
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

function unwrapError(error: PostgrestError | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export async function listStudents() {
  const { data, error } = await supabase.from("students").select("*").order("name");
  unwrapError(error, "Failed to list students");
  return (data ?? []) as Student[];
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  unwrapError(error, `Failed to fetch student ${id}`);
  return (data as Student | null) ?? null;
}

export async function createStudent(payload: Partial<Student>) {
  const { data, error } = await supabase.from("students").insert(payload).select("*").single();
  unwrapError(error, "Failed to create student");
  return data as Student;
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  const { data, error } = await supabase.from("students").update(payload).eq("id", id).select("*").maybeSingle();
  unwrapError(error, `Failed to update student ${id}`);
  return (data as Student | null) ?? null;
}

export async function listAssociations() {
  const { data, error } = await supabase.from("associations").select("*").order("name");
  unwrapError(error, "Failed to list associations");
  return (data ?? []) as Association[];
}

export async function createAssociation(payload: Partial<Association>) {
  const { data, error } = await supabase.from("associations").insert(payload).select("*").single();
  unwrapError(error, "Failed to create association");
  return data as Association;
}

export async function listEvents() {
  const { data, error } = await supabase.from("events").select("*").order("start_time");
  unwrapError(error, "Failed to list events");
  return (data ?? []) as Event[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  unwrapError(error, `Failed to fetch event ${id}`);
  return (data as Event | null) ?? null;
}

export async function createEvent(payload: Partial<Event>) {
  const { data, error } = await supabase.from("events").insert(payload).select("*").single();
  unwrapError(error, "Failed to create event");
  return data as Event;
}

export async function listHelpRequestsForStudent(studentId: string) {
  const { data, error } = await supabase
    .from("help_requests")
    .select("*")
    .or(`requester_id.eq.${studentId},helper_id.eq.${studentId}`)
    .order("created_at", { ascending: false });
  unwrapError(error, `Failed to list help requests for student ${studentId}`);
  return (data ?? []) as HelpRequest[];
}

export async function listHelpRequests() {
  const { data, error } = await supabase
    .from("help_requests")
    .select("*")
    .order("created_at", { ascending: false });
  unwrapError(error, "Failed to list help requests");
  return (data ?? []) as HelpRequest[];
}

export async function createHelpRequest(payload: Partial<HelpRequest>) {
  const { data, error } = await supabase.from("help_requests").insert(payload).select("*").single();
  unwrapError(error, "Failed to create help request");
  return data as HelpRequest;
}

export async function updateHelpRequest(id: string, payload: Partial<HelpRequest>) {
  const { data, error } = await supabase.from("help_requests").update(payload).eq("id", id).select("*").maybeSingle();
  unwrapError(error, `Failed to update help request ${id}`);
  return (data as HelpRequest | null) ?? null;
}

export async function createFeedback(payload: Partial<Feedback>) {
  const { data, error } = await supabase.from("feedback").insert(payload).select("*").single();
  unwrapError(error, "Failed to create feedback");
  return data as Feedback;
}

export async function listFeedbackByStudent(studentId: string) {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .or(`from_student_id.eq.${studentId},to_student_id.eq.${studentId}`);
  unwrapError(error, `Failed to list feedback for ${studentId}`);
  return (data ?? []) as Feedback[];
}

export async function listFeedback() {
  const { data, error } = await supabase.from("feedback").select("*");
  unwrapError(error, "Failed to list feedback");
  return (data ?? []) as Feedback[];
}

export async function upsertImpactRecords(records: Partial<ImpactRecord>[]) {
  if (!records.length) return [];
  const { data, error } = await supabase
    .from("impact_records")
    .upsert(records, { onConflict: "student_id,skill" })
    .select("*");
  unwrapError(error, "Failed to upsert impact records");
  return (data ?? []) as ImpactRecord[];
}

export async function listImpactRecords(studentId?: string) {
  let query = supabase.from("impact_records").select("*");
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  unwrapError(error, "Failed to list impact records");
  return (data ?? []) as ImpactRecord[];
}

export async function createSignal(payload: Partial<StudentSignal>) {
  const { data, error } = await supabase.from("student_signals").insert(payload).select("*").single();
  unwrapError(error, "Failed to create student signal");
  return data as StudentSignal;
}

export async function listSignals(studentId?: string) {
  let query = supabase.from("student_signals").select("*");
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  unwrapError(error, "Failed to list signals");
  return (data ?? []) as StudentSignal[];
}

export async function listTimetableSlots(studentId?: string) {
  let query = supabase.from("timetable_slots").select("*");
  if (studentId) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  unwrapError(error, "Failed to list timetable slots");
  return (data ?? []) as TimetableSlot[];
}

export async function listDataSources(entityType?: string, entityId?: string) {
  let query = supabase.from("data_sources").select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query;
  unwrapError(error, "Failed to list data sources");
  return (data ?? []) as DataSource[];
}

export async function replaceRecommendations(
  studentId: string,
  recommendations: Partial<RecommendationRecord>[],
  assumptionsByRecommendation: Partial<RecommendationAssumption>[][]
) {
  const existing = await supabase.from("recommendations").delete().eq("student_id", studentId);
  unwrapError(existing.error, `Failed clearing recommendations for ${studentId}`);

  if (!recommendations.length) {
    return [];
  }

  const inserted = await supabase.from("recommendations").insert(recommendations).select("*");
  unwrapError(inserted.error, `Failed creating recommendations for ${studentId}`);
  const recs = (inserted.data ?? []) as RecommendationRecord[];

  if (assumptionsByRecommendation.length) {
    const mappedAssumptions = assumptionsByRecommendation.flatMap((assumptions, index) =>
      assumptions.map((assumption) => ({
        ...assumption,
        recommendation_id: assumption.recommendation_id ?? recs[index]?.id
      }))
    );
    const assumptionDelete = await supabase
      .from("recommendation_assumptions")
      .delete()
      .in("recommendation_id", recs.map((rec) => rec.id));
    unwrapError(assumptionDelete.error, "Failed clearing recommendation assumptions");
    const insertedAssumptions = await supabase.from("recommendation_assumptions").insert(mappedAssumptions);
    unwrapError(insertedAssumptions.error, "Failed creating recommendation assumptions");
  }

  return recs;
}
