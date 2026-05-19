-- ⚡ Supabase Cloud Database Table Initialization Script
-- Paste this script directly into your Supabase Dashboard SQL Editor!

-- 1. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo' NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[] DEFAULT '{}'::TEXT[],
    topics JSONB DEFAULT '[]'::JSONB,
    start_date TEXT,
    due_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    subject TEXT DEFAULT 'General Study' NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '' NOT NULL,
    description TEXT DEFAULT '',
    sub_notes JSONB DEFAULT '[]'::JSONB,
    savepoints JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    attended INTEGER DEFAULT 0 NOT NULL,
    total INTEGER DEFAULT 0 NOT NULL,
    target INTEGER DEFAULT 75 NOT NULL
);

-- 4. Create Semesters Table
CREATE TABLE IF NOT EXISTS public.semesters (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    courses JSONB DEFAULT '[]'::JSONB
);

-- 5. Create Goals Table
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    target INTEGER DEFAULT 10 NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('active', 'completed')) DEFAULT 'active' NOT NULL
);

-- 6. Create Profiles Table (for user credentials)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_pic TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Timetable Table
CREATE TABLE IF NOT EXISTS public.timetable (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL
);

-- 8. Add High-Performance Search Indexes
CREATE INDEX IF NOT EXISTS tasks_email_idx ON public.tasks(email);
CREATE INDEX IF NOT EXISTS notes_email_idx ON public.notes(email);
CREATE INDEX IF NOT EXISTS attendance_email_idx ON public.attendance(email);
CREATE INDEX IF NOT EXISTS semesters_email_idx ON public.semesters(email);
CREATE INDEX IF NOT EXISTS goals_email_idx ON public.goals(email);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS timetable_email_idx ON public.timetable(email);

-- Enable RLS (Row Level Security) or allow full public auth access
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Create Open Access Policies for Authenticated/Public Requests
CREATE POLICY "Allow all public access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to semesters" ON public.semesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public access to timetable" ON public.timetable FOR ALL USING (true) WITH CHECK (true);

