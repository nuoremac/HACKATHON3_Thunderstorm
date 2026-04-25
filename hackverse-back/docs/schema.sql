create extension if not exists "pgcrypto";

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  department text not null,
  academic_year text not null,
  interests text[] not null default '{}',
  skills_offered text[] not null default '{}',
  skills_needed text[] not null default '{}',
  availability jsonb not null default '[]'::jsonb,
  profile_links jsonb,
  privacy_level text not null default 'campus',
  profile_completeness numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists associations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  tags text[] not null default '{}',
  contact text,
  recruitment_needs text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  association_id uuid references associations(id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text not null default '',
  capacity integer,
  source text not null default 'unknown_source',
  verification_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists timetable_slots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_name text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text
);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  score numeric not null,
  confidence numeric not null,
  explanation jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists help_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references students(id) on delete cascade,
  helper_id uuid references students(id) on delete set null,
  skill text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references help_requests(id) on delete cascade,
  from_student_id uuid not null references students(id) on delete cascade,
  to_student_id uuid not null references students(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  skill_confirmed text,
  created_at timestamptz not null default now()
);

create table if not exists impact_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  skill text not null,
  helped_count integer not null default 0,
  positive_feedback_count integer not null default 0,
  confidence_score numeric not null default 0
);

create table if not exists data_sources (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  source_type text not null,
  reliability_score numeric not null default 0.2,
  last_updated timestamptz not null default now()
);

create table if not exists student_signals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  signal_type text not null,
  value text not null,
  source text not null,
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists recommendation_assumptions (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  assumption text not null,
  source text not null,
  confidence numeric not null,
  risk_level text not null,
  is_user_confirmed boolean not null default false
);
