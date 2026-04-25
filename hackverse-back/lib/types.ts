export type UUID = string;

export type PrivacyLevel = "public" | "campus" | "private";
export type VerificationStatus = "verified" | "pending" | "unverified";
export type HelpRequestStatus = "open" | "accepted" | "rejected" | "completed" | "rescheduled";
export type RiskLevel = "low" | "medium" | "high";
export type RecommendationType = "student" | "association" | "event" | "help_opportunity";

export interface AvailabilityWindow {
  day?: string;
  start: string;
  end: string;
  location?: string;
}

export interface Student {
  id: UUID;
  name: string;
  email: string;
  department: string;
  academic_year: string;
  interests: string[];
  skills_offered: string[];
  skills_needed: string[];
  availability: AvailabilityWindow[];
  profile_links: Record<string, string> | null;
  privacy_level: PrivacyLevel;
  profile_completeness: number;
  created_at?: string;
}

export interface Association {
  id: UUID;
  name: string;
  description: string;
  tags: string[];
  contact: string | null;
  recruitment_needs: string[];
  created_at?: string;
}

export interface Event {
  id: UUID;
  association_id: UUID;
  title: string;
  description: string;
  tags: string[];
  start_time: string;
  end_time: string;
  location: string;
  capacity: number | null;
  source: string;
  verification_status: VerificationStatus;
  created_at?: string;
}

export interface TimetableSlot {
  id: UUID;
  student_id: UUID;
  course_name: string;
  start_time: string;
  end_time: string;
  location: string | null;
}

export interface RecommendationRecord {
  id: UUID;
  student_id: UUID;
  target_type: RecommendationType;
  target_id: UUID;
  score: number;
  confidence: number;
  explanation: RecommendationExplanation;
  created_at?: string;
}

export interface HelpRequest {
  id: UUID;
  requester_id: UUID;
  helper_id: UUID | null;
  skill: string;
  message: string;
  status: HelpRequestStatus;
  created_at?: string;
  completed_at?: string | null;
}

export interface Feedback {
  id: UUID;
  request_id: UUID;
  from_student_id: UUID;
  to_student_id: UUID;
  rating: number;
  comment: string | null;
  skill_confirmed: string | null;
  created_at?: string;
}

export interface ImpactRecord {
  id: UUID;
  student_id: UUID;
  skill: string;
  helped_count: number;
  positive_feedback_count: number;
  confidence_score: number;
}

export interface DataSource {
  id: UUID;
  entity_type: string;
  entity_id: UUID;
  source_type: string;
  reliability_score: number;
  last_updated: string;
}

export interface StudentSignal {
  id: UUID;
  student_id: UUID;
  signal_type: string;
  value: string;
  source: string;
  confidence: number;
  created_at?: string;
  expires_at?: string | null;
}

export interface RecommendationAssumption {
  id: UUID;
  recommendation_id: UUID;
  assumption: string;
  source: string;
  confidence: number;
  risk_level: RiskLevel;
  is_user_confirmed: boolean;
}

export interface RecommendationExplanation {
  why_this_recommendation: string[];
  why_now: string[];
  data_used: string[];
  assumptions_used: string[];
}

export interface ScoreBreakdown {
  InterestScore: number;
  SkillScore: number;
  AvailabilityScore: number;
  AcademicContextScore: number;
  LocationScore: number;
  SocialProofScore: number;
  FreshnessScore: number;
  SourceReliabilityScore: number;
  ExplorationScore: number;
  MissingDataPenalty: number;
  ConflictPenalty: number;
  AssumptionRiskPenalty: number;
  finalScore: number;
}

export interface RecommendationAssumptionInput {
  assumption: string;
  source: string;
  confidence: number;
  risk_level: RiskLevel;
  confidence_impact: number;
  is_user_confirmed: boolean;
}

export interface RecommendationOutput {
  targetType: RecommendationType;
  targetId: UUID;
  recommendationType: string;
  score: number;
  confidence: number;
  explanation: RecommendationExplanation;
  assumptions: RecommendationAssumptionInput[];
  scoreBreakdown: ScoreBreakdown;
  target: Student | Association | Event | HelpRequest;
}

export interface CandidateContext {
  student: Student;
  targetType: RecommendationType;
  target: Student | Association | Event | HelpRequest;
  sources: DataSource[];
  timetableSlots: TimetableSlot[];
  feedback: Feedback[];
  relevantSignals: StudentSignal[];
  impactRecords: ImpactRecord[];
}
