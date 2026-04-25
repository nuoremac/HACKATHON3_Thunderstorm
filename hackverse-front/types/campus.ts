export type SignalSource =
  | "student-declared"
  | "imported-timetable"
  | "association-verified"
  | "admin-verified"
  | "inferred"
  | "alumni-verified";

export type RecommendationType =
  | "person"
  | "event"
  | "association"
  | "help"
  | "career";

export type RiskLevel = "low" | "medium" | "high";

export type RequestStatus = "Pending" | "Accepted" | "Completed" | "Declined";

export type StudentSignal = {
  id: string;
  label: string;
  value: string;
  source: SignalSource;
  confidence: number;
  expiresInDays: number;
};

export type Student = {
  id: string;
  name: string;
  initials: string;
  department: string;
  academicYear: string;
  status: "new" | "active";
  profileCertainty: number;
  interests: string[];
  skillsOffered: string[];
  skillsNeeded: string[];
  availability: string[];
  location: string;
  signals: StudentSignal[];
};

export type Assumption = {
  id: string;
  text: string;
  source: SignalSource;
  confidence: number;
  risk: RiskLevel;
  confirmed: boolean;
};

export type RecommendationScores = {
  interest: number;
  skill: number;
  availability: number;
  academicContext: number;
  location: number;
  socialProof: number;
  freshness: number;
  sourceReliability: number;
  exploration: number;
  missingDataPenalty: number;
  conflictPenalty: number;
  assumptionRiskPenalty: number;
};

export type Recommendation = {
  id: string;
  type: RecommendationType;
  title: string;
  subtitle: string;
  description: string;
  target: string;
  actionLabel: string;
  secondaryActionLabel: string;
  reasons: string[];
  assumptions: Assumption[];
  tags: string[];
  scores: RecommendationScores;
};

export type ImpactSkill = {
  name: string;
  helpedCount: number;
  positiveFeedback: number;
  confidence: number;
};

export type ImpactProfile = {
  studentId: string;
  headline: string;
  links: {
    label: string;
    href: string;
  }[];
  skills: ImpactSkill[];
  badges: string[];
};

export type HelpRequest = {
  id: string;
  title: string;
  requester: string;
  receiver: string;
  skill: string;
  detail: string;
  status: RequestStatus;
  suggestedSlot: string;
};

export type CampusEvent = {
  id: string;
  title: string;
  association: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  tags: string[];
  capacity: number;
  interestedCount: number;
  verified: boolean;
  relevance: number;
};

export type Association = {
  id: string;
  name: string;
  mission: string;
  tags: string[];
  recruitmentNeeds: string[];
  activeEvents: number;
  relevantStudents: number;
};

export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "warning" | "success";
};

export type EngagementDatum = {
  domain: string;
  engagement: number;
  isolationRisk: number;
};

export type RiskItem = {
  title: string;
  description: string;
  severity: RiskLevel;
};

export type AdoptionPhase = {
  period: string;
  title: string;
  actions: string[];
};
