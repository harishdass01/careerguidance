/*
# Career Guidance System - Complete Database Schema

1. New Tables
- `user_roles` - Maps auth users to roles (student/admin)
- `student_profiles` - Student academic and personal info
- `skills` - Master list of skills
- `student_skills` - Maps students to their skills with proficiency levels
- `careers` - Master list of career paths
- `career_skills` - Maps careers to required skills with importance weights
- `assessment_questions` - Master assessment questions by category
- `assessment_answers` - Student answers to assessment questions
- `career_recommendations` - AI-generated career recommendations stored per student
- `learning_roadmaps` - Roadmap phases for each career
- `roadmap_progress` - Tracks student completion of roadmap phases
- `projects` - Suggested projects per career
- `certifications` - Suggested certifications per career
- `resume_analyses` - Stores resume analysis results (not the file itself)

2. Security
- RLS enabled on all tables
- Students can only access their own data
- Admins can read all student data
- Public reference data (skills, careers, assessment questions, projects, certifications, learning roadmaps) is readable by all authenticated users
- Only admins can write to reference/master tables
- Students can write to their own data tables

3. Notes
- Uses auth.uid() for ownership checks
- user_id columns default to auth.uid() for easy inserts
- Admin role stored in user_roles table
*/

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_role" ON user_roles;
CREATE POLICY "select_own_role" ON user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_role" ON user_roles;
CREATE POLICY "insert_own_role" ON user_roles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_role" ON user_roles;
CREATE POLICY "update_own_role" ON user_roles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SKILLS (master reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'technical',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skills_select_all" ON skills;
CREATE POLICY "skills_select_all" ON skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "skills_insert_admin" ON skills;
CREATE POLICY "skills_insert_admin" ON skills FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "skills_update_admin" ON skills;
CREATE POLICY "skills_update_admin" ON skills FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "skills_delete_admin" ON skills;
CREATE POLICY "skills_delete_admin" ON skills FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- CAREERS (master reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  required_skills text[],
  recommended_education text,
  typical_projects text[],
  related_careers text[],
  growth_outlook text,
  avg_salary text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "careers_select_all" ON careers;
CREATE POLICY "careers_select_all" ON careers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "careers_insert_admin" ON careers;
CREATE POLICY "careers_insert_admin" ON careers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "careers_update_admin" ON careers;
CREATE POLICY "careers_update_admin" ON careers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "careers_delete_admin" ON careers;
CREATE POLICY "careers_delete_admin" ON careers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- CAREER SKILLS (maps careers to required skills)
-- ============================================================
CREATE TABLE IF NOT EXISTS career_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance integer NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now(),
  UNIQUE(career_id, skill_id)
);

ALTER TABLE career_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "career_skills_select_all" ON career_skills;
CREATE POLICY "career_skills_select_all" ON career_skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "career_skills_insert_admin" ON career_skills;
CREATE POLICY "career_skills_insert_admin" ON career_skills FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "career_skills_update_admin" ON career_skills;
CREATE POLICY "career_skills_update_admin" ON career_skills FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "career_skills_delete_admin" ON career_skills;
CREATE POLICY "career_skills_delete_admin" ON career_skills FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- ASSESSMENT QUESTIONS (master reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text NOT NULL,
  options jsonb NOT NULL DEFAULT '[{"text":"Strongly Disagree","value":1},{"text":"Disagree","value":2},{"text":"Neutral","value":3},{"text":"Agree","value":4},{"text":"Strongly Agree","value":5}]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessment_questions_select_all" ON assessment_questions;
CREATE POLICY "assessment_questions_select_all" ON assessment_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "assessment_questions_insert_admin" ON assessment_questions;
CREATE POLICY "assessment_questions_insert_admin" ON assessment_questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "assessment_questions_update_admin" ON assessment_questions;
CREATE POLICY "assessment_questions_update_admin" ON assessment_questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "assessment_questions_delete_admin" ON assessment_questions;
CREATE POLICY "assessment_questions_delete_admin" ON assessment_questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- STUDENT PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text,
  email text,
  department text,
  year text,
  cgpa numeric(4,2),
  academic_percentage numeric(5,2),
  technical_skills text[] DEFAULT '{}',
  soft_skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  projects jsonb DEFAULT '[]'::jsonb,
  preferred_career_domain text,
  career_goal text,
  previous_experience text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON student_profiles;
CREATE POLICY "select_own_profile" ON student_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON student_profiles;
CREATE POLICY "insert_own_profile" ON student_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON student_profiles;
CREATE POLICY "update_own_profile" ON student_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON student_profiles;
CREATE POLICY "delete_own_profile" ON student_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin can read all student profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON student_profiles;
CREATE POLICY "admin_select_all_profiles" ON student_profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- STUDENT SKILLS (maps students to skills with proficiency)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency integer NOT NULL DEFAULT 50 CHECK (proficiency BETWEEN 0 AND 100),
  category text DEFAULT 'technical',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_student_skills" ON student_skills;
CREATE POLICY "select_own_student_skills" ON student_skills FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_student_skills" ON student_skills;
CREATE POLICY "insert_own_student_skills" ON student_skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_student_skills" ON student_skills;
CREATE POLICY "update_own_student_skills" ON student_skills FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_student_skills" ON student_skills;
CREATE POLICY "delete_own_student_skills" ON student_skills FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_student_skills" ON student_skills;
CREATE POLICY "admin_select_all_student_skills" ON student_skills FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- ASSESSMENT ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_value integer NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_answers" ON assessment_answers;
CREATE POLICY "select_own_answers" ON assessment_answers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_answers" ON assessment_answers;
CREATE POLICY "insert_own_answers" ON assessment_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_answers" ON assessment_answers;
CREATE POLICY "delete_own_answers" ON assessment_answers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_answers" ON assessment_answers;
CREATE POLICY "admin_select_all_answers" ON assessment_answers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- CAREER RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  career_name text NOT NULL,
  match_percentage integer NOT NULL DEFAULT 0,
  reason text,
  matching_skills text[] DEFAULT '{}',
  missing_skills text[] DEFAULT '{}',
  recommended_resources jsonb DEFAULT '[]'::jsonb,
  suggested_projects jsonb DEFAULT '[]'::jsonb,
  growth_info text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recommendations" ON career_recommendations;
CREATE POLICY "select_own_recommendations" ON career_recommendations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recommendations" ON career_recommendations;
CREATE POLICY "insert_own_recommendations" ON career_recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_recommendations" ON career_recommendations;
CREATE POLICY "delete_own_recommendations" ON career_recommendations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_recommendations" ON career_recommendations;
CREATE POLICY "admin_select_all_recommendations" ON career_recommendations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- LEARNING ROADMAPS (master data per career)
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_name text NOT NULL,
  phase_number integer NOT NULL,
  phase_title text NOT NULL,
  objectives text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  resources jsonb DEFAULT '[]'::jsonb,
  project_task text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(career_name, phase_number)
);

ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmaps_select_all" ON learning_roadmaps;
CREATE POLICY "roadmaps_select_all" ON learning_roadmaps FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "roadmaps_insert_admin" ON learning_roadmaps;
CREATE POLICY "roadmaps_insert_admin" ON learning_roadmaps FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "roadmaps_update_admin" ON learning_roadmaps;
CREATE POLICY "roadmaps_update_admin" ON learning_roadmaps FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "roadmaps_delete_admin" ON learning_roadmaps;
CREATE POLICY "roadmaps_delete_admin" ON learning_roadmaps FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- ROADMAP PROGRESS (student-specific tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  career_name text NOT NULL,
  phase_number integer NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, career_name, phase_number)
);

ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_roadmap_progress" ON roadmap_progress;
CREATE POLICY "select_own_roadmap_progress" ON roadmap_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_roadmap_progress" ON roadmap_progress;
CREATE POLICY "insert_own_roadmap_progress" ON roadmap_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_roadmap_progress" ON roadmap_progress;
CREATE POLICY "update_own_roadmap_progress" ON roadmap_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_roadmap_progress" ON roadmap_progress;
CREATE POLICY "delete_own_roadmap_progress" ON roadmap_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_roadmap_progress" ON roadmap_progress;
CREATE POLICY "admin_select_all_roadmap_progress" ON roadmap_progress FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- PROJECTS (suggested projects per career)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_name text NOT NULL,
  title text NOT NULL,
  description text,
  difficulty text DEFAULT 'intermediate',
  skills_required text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_all" ON projects;
CREATE POLICY "projects_select_all" ON projects FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "projects_insert_admin" ON projects;
CREATE POLICY "projects_insert_admin" ON projects FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "projects_update_admin" ON projects;
CREATE POLICY "projects_update_admin" ON projects FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "projects_delete_admin" ON projects;
CREATE POLICY "delete_admin_projects" ON projects FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- CERTIFICATIONS (suggested certifications per career)
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_name text NOT NULL,
  name text NOT NULL,
  provider text,
  description text,
  url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certifications_select_all" ON certifications;
CREATE POLICY "certifications_select_all" ON certifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "certifications_insert_admin" ON certifications;
CREATE POLICY "certifications_insert_admin" ON certifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "certifications_update_admin" ON certifications;
CREATE POLICY "certifications_update_admin" ON certifications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

DROP POLICY IF EXISTS "certifications_delete_admin" ON certifications;
CREATE POLICY "certifications_delete_admin" ON certifications FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- RESUME ANALYSES (stores analysis results, not the file)
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text,
  detected_skills text[] DEFAULT '{}',
  relevant_careers jsonb DEFAULT '[]'::jsonb,
  missing_skills text[] DEFAULT '{}',
  completeness integer DEFAULT 0,
  suggestions text[] DEFAULT '{}',
  project_recommendations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resume_analyses" ON resume_analyses;
CREATE POLICY "select_own_resume_analyses" ON resume_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resume_analyses" ON resume_analyses;
CREATE POLICY "insert_own_resume_analyses" ON resume_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resume_analyses" ON resume_analyses;
CREATE POLICY "delete_own_resume_analyses" ON resume_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all_resume_analyses" ON resume_analyses;
CREATE POLICY "admin_select_all_resume_analyses" ON resume_analyses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin')
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_user_id ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_user_id ON assessment_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_id ON roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_career_skills_career_id ON career_skills(career_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
