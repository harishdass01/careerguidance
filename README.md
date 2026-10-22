# AI-Enhanced Career Guidance System for Personalized Career Pathways

An AI-powered career guidance platform for college students that analyzes academic information, skills, interests, aptitude results, certifications, projects, and career preferences to provide personalized career recommendations, skill-gap analysis, and step-by-step learning roadmaps.

## Features

### Student Portal
- **Dashboard** — Overview with profile completion, top career match, skill level, roadmap progress, and assessment scores
- **Profile** — Complete academic and personal profile with skills, interests, certifications, and projects
- **Career Assessment** — 30-question assessment across 10 categories with visual results (radar + bar charts)
- **AI Career Recommendations** — Personalized top-5 career matches with match percentage, matching/missing skills, resources, and suggested projects
- **Skill Gap Analysis** — Visual comparison of current vs required skills with priority levels
- **Learning Roadmap** — Phase-by-phase learning path for each career with objectives, skills, resources, and completion tracking
- **Resume Analyzer** — Upload resume for AI analysis of detected skills, career matches, completeness, and improvement suggestions
- **Career Explorer** — Browse 10 career categories with descriptions, skills, education, projects, certifications, and roadmaps
- **CareerAI Chatbot** — AI-powered assistant that provides personalized career guidance using student profile data
- **Progress Dashboard** — Track career readiness, skills, roadmap progress, certifications, and projects with charts

### Admin Panel
- **Dashboard** — System overview with student count, career stats, department distribution, and skill gap analytics
- **Students** — View all registered students with search and detailed profile views
- **Career Paths** — CRUD management of career listings
- **Skills** — CRUD management of technical and soft skills
- **Assessment Questions** — CRUD management of assessment questions by category
- **Analytics** — Comprehensive statistics including recommendation trends, department distribution, and skill gap analysis

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: Mock AI service layer (swap for real AI API via env var)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. The Supabase database is pre-configured. Database migrations (schema + seed data) are applied automatically.

3. (Optional) To connect a real AI API instead of the mock service:
   - Add `VITE_AI_API_KEY` and `VITE_AI_API_URL` to your `.env` file
   - The AI service layer in `src/lib/aiService.ts` will automatically use the external API when the key is present

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## Database Schema

The system uses PostgreSQL with the following tables:
- `user_roles` — Maps users to student/admin roles
- `student_profiles` — Student academic and personal information
- `skills` — Master skill list (technical + soft)
- `student_skills` — Student skill proficiency levels
- `careers` — Career path definitions
- `career_skills` — Career-to-skill mappings with importance weights
- `assessment_questions` — Assessment questions by category
- `assessment_answers` — Student assessment responses
- `career_recommendations` — AI-generated career recommendations
- `learning_roadmaps` — Phase-by-phase roadmap data per career
- `roadmap_progress` — Student roadmap completion tracking
- `projects` — Suggested projects per career
- `certifications` — Recommended certifications per career
- `resume_analyses` — Resume analysis results

All tables have Row Level Security (RLS) enabled with:
- Students can only access their own data
- Admins can read all student data
- Reference data (careers, skills, questions) is readable by all authenticated users
- Only admins can write to reference/master tables

## Demo Data

The system comes pre-seeded with:
- 10 career paths across 10 categories
- 30+ skills (technical and soft)
- 30 assessment questions (10 categories, 3 each)
- 60+ career-skill mappings
- 70 learning roadmap phases
- 25 suggested projects
- 20 recommended certifications

## Authentication

- Email/password authentication via Supabase Auth
- Two roles: Student and Admin
- Protected routes with role-based access control
- Students cannot access admin pages and vice versa

## AI Service Layer

The AI service (`src/lib/aiService.ts`) provides three functions:
- `generateRecommendations()` — Career recommendations based on profile + assessment
- `generateChatbotResponse()` — Chatbot responses using student context
- `analyzeResume()` — Resume analysis with skill detection

When `VITE_AI_API_KEY` is not set, a rule-based mock implementation handles all requests. To connect a real AI API, set the environment variables — the function signatures stay the same so the frontend requires no changes.

## Creating an Admin Account

1. Sign up with the "Admin" role selected on the registration page
2. The admin panel will be accessible at `/admin/dashboard`

## Project Structure

```
src/
├── components/         # Shared UI components (layouts, cards, badges)
├── context/           # Auth context provider
├── lib/               # Supabase client + AI service layer
├── pages/
│   ├── AuthPage.tsx   # Login/Signup
│   ├── student/       # All student pages
│   └── admin/         # All admin pages
├── types/             # TypeScript type definitions
├── App.tsx            # Router with protected routes
└── main.tsx           # Entry point
```
