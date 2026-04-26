import type {
  Student,
  Recommendation,
  CampusEvent,
  Association,
  HelpRequest,
  ImpactProfile,
  RequestStatus,
  Assumption,
} from "@/types/campus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60; // 1 minute

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  const result = await response.json();
  const data = result.data || result;
  
  cache.set(endpoint, { data, timestamp: Date.now() });
  return data;
}

// Helpers for mapping
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export async function getStudents(): Promise<Student[]> {
  const data = await fetchAPI<any[]>("/api/students");
  return data.map(mapBackendStudent);
}

export async function getStudentById(id: string): Promise<Student> {
  const data = await fetchAPI<any>(`/api/students/${id}`);
  return mapBackendStudent(data);
}

export async function getRecommendations(studentId: string): Promise<Recommendation[]> {
  const data = await fetchAPI<any>(`/api/recommendations/${studentId}`);
  return data.recommendations.map((rec: any) => ({
    id: rec.targetId,
    type: mapRecType(rec.targetType),
    title: rec.target?.title || rec.target?.name || "Requirement Match",
    subtitle: rec.target?.subtitle || rec.target?.department || "Recommended for you",
    description: rec.explanation?.why_this_recommendation?.[0] || "",
    target: rec.target?.name || rec.target?.title || "Contextual Radar",
    actionLabel: "View Details",
    secondaryActionLabel: "Not interested",
    reasons: rec.explanation.why_this_recommendation,
    tags: rec.target.tags || [],
    scores: {
      interest: rec.scoreBreakdown?.InterestScore || 0,
      skill: rec.scoreBreakdown?.SkillScore || 0,
      availability: rec.scoreBreakdown?.AvailabilityScore || 0,
      academicContext: rec.scoreBreakdown?.AcademicContextScore || 0,
      location: rec.scoreBreakdown?.LocationScore || 0,
      socialProof: rec.scoreBreakdown?.SocialProofScore || 0,
      freshness: rec.scoreBreakdown?.FreshnessScore || 0,
      sourceReliability: rec.scoreBreakdown?.SourceReliabilityScore || 0,
      exploration: rec.scoreBreakdown?.ExplorationScore || 0,
      missingDataPenalty: rec.scoreBreakdown?.MissingDataPenalty || 0,
      conflictPenalty: rec.scoreBreakdown?.ConflictPenalty || 0,
      assumptionRiskPenalty: rec.scoreBreakdown?.AssumptionRiskPenalty || 0,
    },
    assumptions: rec.assumptions.map((a: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: a.assumption,
      source: a.source as any,
      confidence: a.confidence,
      risk: a.risk_level as any,
      confirmed: a.is_user_confirmed,
    })),
  }));
}

export async function getEvents(): Promise<CampusEvent[]> {
  const data = await fetchAPI<any[]>("/api/events");
  return data.map((e: any) => ({
    id: e.id,
    title: e.title,
    association: "Mapped Association", // Would need another lookup usually
    description: e.description,
    startTime: e.start_time,
    endTime: e.end_time,
    location: e.location,
    tags: e.tags || [],
    capacity: e.capacity || 0,
    interestedCount: 0,
    verified: e.verification_status === "verified",
    relevance: 0.8,
  }));
}

export async function getAssociations(): Promise<Association[]> {
  const data = await fetchAPI<any[]>("/api/associations");
  return data.map((a: any) => ({
    id: a.id,
    name: a.name,
    mission: a.mission || a.description || "",
    tags: a.tags || [],
    recruitmentNeeds: a.recruitment_needs || [],
    activeEvents: 0,
    relevantStudents: 0,
  }));
}

export async function getImpactProfile(studentId: string): Promise<ImpactProfile> {
  const data = await fetchAPI<any>(`/api/impact/${studentId}`);
  return {
    studentId: studentId,
    headline: "Active Mentor",
    links: [],
    skills: data.map((s: any) => ({
      name: s.skill,
      helpedCount: s.helped_count,
      positiveFeedback: s.positive_feedback_count,
      confidence: s.confidence_score,
    })),
    badges: ["Top Helper"],
  };
}

function mapBackendStudent(s: any): Student {
  return {
    id: s.id,
    name: s.name,
    email: s.email || "",
    initials: getInitials(s.name),
    department: s.department,
    academicYear: s.academic_year,
    status: s.profile_completeness > 0.6 ? "active" : "new",
    profileCertainty: s.profile_completeness,
    interests: s.interests || [],
    skillsOffered: s.skills_offered || [],
    skillsNeeded: s.skills_needed || [],
    availability: s.availability?.map((a: any) => `${a.day || ""} ${a.start}-${a.end}`) || [],
    location: "Campus",
    signals: [],
  };
}

function mapRecType(type: string): any {
  switch (type) {
    case "student": return "person";
    case "help_opportunity": return "help";
    default: return type;
  }
}
