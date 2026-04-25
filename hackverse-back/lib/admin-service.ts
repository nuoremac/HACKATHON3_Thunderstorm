import { buildQualityMetrics } from "@/lib/data-trust";
import {
  listAssociations,
  listEvents,
  listFeedback,
  listHelpRequests,
  listSignals,
  listStudents
} from "@/lib/db";

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function buildAdminAnalytics() {
  const [students, associations, events, feedback, signals] = await Promise.all([
    listStudents(),
    listAssociations(),
    listEvents(),
    listFeedback(),
    listSignals()
  ]);

  const helpRequests = await listHelpRequests();

  const engagementByDepartment = Object.values(
    students.reduce<Record<string, { department: string; students: number; feedback: number; signals: number }>>(
      (acc, student) => {
        const department = student.department || "Unknown";
        const feedbackCount = feedback.filter(
          (item) => item.from_student_id === student.id || item.to_student_id === student.id
        ).length;
        const signalCount = signals.filter((item) => item.student_id === student.id).length;
        const current = acc[department] ?? {
          department,
          students: 0,
          feedback: 0,
          signals: 0
        };
        current.students += 1;
        current.feedback += feedbackCount;
        current.signals += signalCount;
        acc[department] = current;
        return acc;
      },
      {}
    )
  );

  const skillRequestCounts = new Map<string, number>();
  helpRequests.forEach((request) => {
    skillRequestCounts.set(request.skill, (skillRequestCounts.get(request.skill) ?? 0) + 1);
  });

  const isolatedStudents = students.filter((student) => {
    const studentRequests = helpRequests.filter(
      (request) => request.requester_id === student.id || request.helper_id === student.id
    );
    const studentFeedback = feedback.filter(
      (item) => item.from_student_id === student.id || item.to_student_id === student.id
    );
    const studentSignals = signals.filter((item) => item.student_id === student.id);
    return studentRequests.length + studentFeedback.length + studentSignals.length <= 1;
  });

  const invisibleEvents = events.filter((event) => {
    const eventSignals = signals.filter(
      (signal) => signal.signal_type === "event_interest" && signal.value === event.id
    );
    return eventSignals.length === 0 && event.verification_status !== "verified";
  });

  return {
    engagement_by_department: engagementByDepartment,
    most_requested_skills: [...skillRequestCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count })),
    isolated_students: isolatedStudents.map((student) => ({
      id: student.id,
      name: student.name,
      department: student.department,
      academic_year: student.academic_year
    })),
    invisible_events: invisibleEvents.map((event) => ({
      id: event.id,
      title: event.title,
      association_id: event.association_id,
      verification_status: event.verification_status
    })),
    system_health_metrics: {
      student_count: students.length,
      association_count: associations.length,
      event_count: events.length,
      avg_profile_completeness: average(students.map((student) => student.profile_completeness)),
      total_signals: signals.length,
      total_feedback: feedback.length,
      data_quality_warnings: [
        `${students.filter((student) => student.profile_completeness < 0.5).length} students have low profile completeness.`,
        `${events.filter((event) => event.verification_status !== "verified").length} events are not verified.`,
        `${signals.filter((signal) => signal.expires_at && new Date(signal.expires_at) < new Date()).length} signals have expired and should be reviewed.`
      ]
    }
  };
}

export async function buildAdminQualityMetrics() {
  const [students, associations, events, helpRequests] = await Promise.all([
    listStudents(),
    listAssociations(),
    listEvents(),
    listHelpRequests()
  ]);

  return buildQualityMetrics({
    students,
    associations,
    events,
    helpRequests
  });
}
