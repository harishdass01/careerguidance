import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, ProgressBar, Badge, EmptyState } from '@/components/ui';
import type { Profile, CareerRecommendation, AssessmentAnswer, RoadmapProgress, StudentSkill } from '@/types';
import {
  UserCircle, Sparkles, TrendingUp, Award, Target, BookOpen, ClipboardList,
  CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

export function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profileRes, recRes, ansRes, progRes, skillsRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('career_recommendations').select('*').eq('user_id', user.id).order('match_percentage', { ascending: false }).limit(3),
        supabase.from('assessment_answers').select('*').eq('user_id', user.id),
        supabase.from('roadmap_progress').select('*').eq('user_id', user.id),
        supabase.from('student_skills').select('*').eq('user_id', user.id),
      ]);

      setProfile(profileRes.data as Profile | null);
      setRecommendations(recRes.data as CareerRecommendation[] || []);
      setAnswers(ansRes.data as AssessmentAnswer[] || []);
      setRoadmapProgress(progRes.data as RoadmapProgress[] || []);
      setStudentSkills(skillsRes.data as StudentSkill[] || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;

  const profileCompletion = calculateProfileCompletion(profile);
  const topRec = recommendations[0];
  const completedPhases = roadmapProgress.filter((p) => p.completed).length;
  const totalPhases = roadmapProgress.length;
  const avgSkillLevel = studentSkills.length > 0
    ? Math.round(studentSkills.reduce((sum, s) => sum + s.proficiency, 0) / studentSkills.length)
    : 0;

  const categoryMap = new Map<string, number>();
  answers.forEach((a) => {
    const cur = categoryMap.get(a.category) || 0;
    categoryMap.set(a.category, cur + a.answer_value);
  });
  const radarData = Array.from(categoryMap.entries()).map(([category, score]) => ({
    category: category.length > 15 ? category.slice(0, 13) + '...' : category,
    score: (score / 15) * 100,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'Student'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your career journey</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCircle} label="Profile Completion" value={`${profileCompletion}%`} color="blue" progress={profileCompletion} />
        <StatCard icon={Target} label="Top Career Match" value={topRec ? `${topRec.match_percentage}%` : '—'} color="cyan" subtitle={topRec?.career_name} />
        <StatCard icon={TrendingUp} label="Avg Skill Level" value={`${avgSkillLevel}%`} color="green" progress={avgSkillLevel} />
        <StatCard icon={CheckCircle2} label="Roadmap Progress" value={`${completedPhases}/${totalPhases}`} color="indigo" progress={totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top recommendation */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Top Recommended Career
            </h2>
            <Link to="/recommendations" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topRec ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{topRec.career_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{topRec.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{topRec.match_percentage}%</div>
                  <div className="text-xs text-gray-400">Match</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-green-600 mb-2">Matching Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topRec.matching_skills.length > 0 ? topRec.matching_skills.map((s) => (
                      <Badge key={s} color="green">{s}</Badge>
                    )) : <span className="text-xs text-gray-400">None yet</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-600 mb-2">Skills to Improve</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topRec.missing_skills.length > 0 ? topRec.missing_skills.map((s) => (
                      <Badge key={s} color="orange">{s}</Badge>
                    )) : <span className="text-xs text-gray-400">None — you're ready!</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon={Sparkles} title="No recommendations yet" description="Complete your profile and take the assessment to get personalized career recommendations." />
          )}
        </Card>

        {/* Assessment radar */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Assessment Scores
          </h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={ClipboardList} title="No assessment yet" description="Take the career assessment to see your aptitude scores." />
          )}
          {radarData.length > 0 && (
            <Link to="/assessment" className="block text-center mt-4 text-sm text-blue-600 hover:underline">
              Retake assessment
            </Link>
          )}
        </Card>
      </div>

      {/* Skill gap summary & learning progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Skill Gap Summary
            </h2>
            <Link to="/skill-gap" className="text-sm text-blue-600 hover:underline">Details</Link>
          </div>
          {topRec ? (
            <div className="space-y-3">
              {topRec.matching_skills.slice(0, 3).map((skill) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{skill}</span>
                    <Badge color="green">Mastered</Badge>
                  </div>
                  <ProgressBar value={85} color="green" />
                </div>
              ))}
              {topRec.missing_skills.slice(0, 3).map((skill) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{skill}</span>
                    <Badge color="red">Missing</Badge>
                  </div>
                  <ProgressBar value={15} color="red" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Award} title="No skill gap data" description="Get career recommendations first to see your skill gap analysis." />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Learning Progress
            </h2>
            <Link to="/roadmap" className="text-sm text-blue-600 hover:underline">View roadmap</Link>
          </div>
          {totalPhases > 0 ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Overall Progress</span>
                  <span className="font-semibold text-blue-600">{Math.round((completedPhases / totalPhases) * 100)}%</span>
                </div>
                <ProgressBar value={(completedPhases / totalPhases) * 100} color="blue" />
              </div>
              {roadmapProgress.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  {p.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-200 rounded-full flex-shrink-0" />
                  )}
                  <span className={`text-sm ${p.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    Phase {p.phase_number}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No roadmap started" description="Get career recommendations and start a learning roadmap to track your progress." />
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/profile', label: 'Update Profile', icon: UserCircle },
            { to: '/assessment', label: 'Take Assessment', icon: ClipboardList },
            { to: '/resume', label: 'Analyze Resume', icon: AlertCircle },
            { to: '/chatbot', label: 'Ask CareerAI', icon: Sparkles },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <action.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle, progress }: {
  icon: React.ElementType; label: string; value: string; color: string; subtitle?: string; progress?: number;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1 truncate">{subtitle}</div>}
      {progress !== undefined && (
        <div className="mt-3">
          <ProgressBar value={progress} color={color} />
        </div>
      )}
    </Card>
  );
}

function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  const fields = [
    profile.full_name, profile.department, profile.year, profile.cgpa,
    profile.academic_percentage, profile.preferred_career_domain, profile.career_goal,
    profile.previous_experience,
  ];
  const arrays = [
    profile.technical_skills, profile.soft_skills, profile.interests,
    profile.certifications, profile.projects,
  ];
  let filled = 0;
  fields.forEach((f) => { if (f !== null && f !== undefined && f !== '') filled++; });
  arrays.forEach((a) => { if (a && a.length > 0) filled++; });
  return Math.round((filled / 13) * 100);
}
