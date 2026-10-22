export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  department: string | null;
  year: string | null;
  cgpa: number | null;
  academic_percentage: number | null;
  technical_skills: string[];
  soft_skills: string[];
  interests: string[];
  certifications: string[];
  projects: ProjectEntry[];
  preferred_career_domain: string | null;
  career_goal: string | null;
  previous_experience: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface StudentSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency: number;
  category: string;
}

export interface Career {
  id: string;
  name: string;
  category: string;
  description: string;
  required_skills: string[];
  recommended_education: string | null;
  typical_projects: string[];
  related_careers: string[];
  growth_outlook: string | null;
  avg_salary: string | null;
}

export interface CareerSkill {
  id: string;
  career_id: string;
  skill_id: string;
  importance: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  options: { text: string; value: number }[];
}

export interface AssessmentAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer_value: number;
  category: string;
  created_at: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  career_name: string;
  match_percentage: number;
  reason: string;
  matching_skills: string[];
  missing_skills: string[];
  recommended_resources: { title: string; url: string }[];
  suggested_projects: { title: string; description: string }[];
  growth_info: string;
  created_at: string;
}

export interface LearningRoadmap {
  id: string;
  career_name: string;
  phase_number: number;
  phase_title: string;
  objectives: string[];
  skills: string[];
  resources: { title: string; url: string }[];
  project_task: string | null;
}

export interface RoadmapProgress {
  id: string;
  user_id: string;
  career_name: string;
  phase_number: number;
  completed: boolean;
  completed_at: string | null;
}

export interface Project {
  id: string;
  career_name: string;
  title: string;
  description: string;
  difficulty: string;
  skills_required: string[];
}

export interface Certification {
  id: string;
  career_name: string;
  name: string;
  provider: string;
  description: string;
  url: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  file_name: string | null;
  detected_skills: string[];
  relevant_careers: { career: string; match: number }[];
  missing_skills: string[];
  completeness: number;
  suggestions: string[];
  project_recommendations: string[];
  created_at: string;
}
