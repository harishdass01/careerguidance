import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, ProgressBar, Badge, EmptyState } from '@/components/ui';
import type { Profile, CareerRecommendation, AssessmentAnswer, RoadmapProgress, StudentSkill } from '@/types';
import {
  TrendingUp, CheckCircle2, Award, BookOpen, Briefcase, Target,
  ClipboardList, GraduationCap,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ea580c'];

export function ProgressPage() {
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
      const [profRes, recRes, ansRes, progRes, skillRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('career_recommendations').select('*').eq('user_id', user.id).order('match_percentage', { ascending: false }),
        supabase.from('assessment_answers').select('*').eq('user_id', user.id),
        supabase.from('roadmap_progress').select('*').eq('user_id', user.id),
        supabase.from('student_skills').select('*').eq('user_id', user.id),
      ]);
      setProfile(profRes.data as Profile | null);
      setRecommendations(recRes.data as CareerRecommendation[] || []);
      setAnswers(ansRes.data as AssessmentAnswer[] || []);
      setRoadmapProgress(progRes.data as RoadmapProgress[] || []);
      setStudentSkills(skillRes.data as StudentSkill[] || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading progress...</div>;

  const completedSkills = studentSkills.filter((s) => s.proficiency >= 70).length;
  const totalSkills = studentSkills.length;
  const completedPhases = roadmapProgress.filter((p) => p.completed).length;
  const totalPhases = roadmapProgress.length;
  const certCount = profile?.certifications?.length || 0;
  const projectCount = profile?.projects?.length || 0;

  const categoryMap = new Map<string, number>();
  answers.forEach((a) => categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + a.answer_value));
  const assessmentScores = Array.from(categoryMap.entries()).map(([cat, score]) => ({
    name: cat.length > 15 ? cat.slice(0, 13) + '...' : cat,
    score: Math.round((score / 15) * 100),
  }));

  const avgAssessment = assessmentScores.length > 0
    ? Math.round(assessmentScores.reduce((sum, s) => sum + s.score, 0) / assessmentScores.length)
    : 0;

  const readinessFactors = [
    { label: 'Profile', value: profile ? 100 : 0 },
    { label: 'Assessment', value: answers.length > 0 ? 100 : 0 },
    { label: 'Skills', value: totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0 },
    { label: 'Roadmap', value: totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0 },
    { label: 'Projects', value: Math.min(100, projectCount * 25) },
    { label: 'Certs', value: Math.min(100, certCount * 25) },
  ];
  const careerReadiness = Math.round(readinessFactors.reduce((sum, f) => sum + f.value, 0) / readinessFactors.length);

  const readinessData = [{ name: 'Readiness', value: careerReadiness, fill: '#2563eb' }];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your career readiness and achievements</p>
      </div>

      {/* Career Readiness Gauge */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={readinessData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} fill="#2563eb" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Overall Career Readiness</h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">{careerReadiness}%</div>
            <p className="text-sm text-gray-500 mb-4">
              {careerReadiness >= 75 ? 'Excellent! You are well-prepared for your career journey.' :
               careerReadiness >= 50 ? 'Good progress! Keep working on your skills and roadmap.' :
               'Getting started. Complete your profile and assessment to improve your readiness.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {readinessFactors.map((f) => (
                <div key={f.label} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{f.value}%</div>
                  <div className="text-xs text-gray-500">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Skills Mastered" value={`${completedSkills}/${totalSkills}`} color="green" />
        <StatCard icon={BookOpen} label="Roadmap Tasks" value={`${completedPhases}/${totalPhases}`} color="blue" />
        <StatCard icon={Award} label="Certifications" value={certCount.toString()} color="yellow" />
        <StatCard icon={Briefcase} label="Projects" value={projectCount.toString()} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment scores */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Assessment Scores
          </h2>
          {assessmentScores.length > 0 ? (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-center">
                <span className="text-sm text-blue-600">Average Score: </span>
                <span className="text-lg font-bold text-blue-700">{avgAssessment}%</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={assessmentScores} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {assessmentScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <EmptyState icon={ClipboardList} title="No assessment taken" description="Take the career assessment to track your scores." />
          )}
        </Card>

        {/* Skill progress */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            Skill Progress
          </h2>
          {studentSkills.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {studentSkills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{skill.skill_name}</span>
                    <span className="text-gray-500">{skill.proficiency}%</span>
                  </div>
                  <ProgressBar value={skill.proficiency} color={skill.proficiency >= 70 ? 'green' : skill.proficiency >= 40 ? 'yellow' : 'red'} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Target} title="No skills tracked" description="Add skills in your profile to track your progress." />
          )}
        </Card>
      </div>

      {/* Certifications & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-600" />
            Certifications
          </h2>
          {profile?.certifications && profile.certifications.length > 0 ? (
            <div className="space-y-2">
              {profile.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No certifications added yet.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Projects
          </h2>
          {profile?.projects && profile.projects.length > 0 ? (
            <div className="space-y-2">
              {profile.projects.map((proj, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-900">{proj.title}</h3>
                  {proj.description && <p className="text-xs text-gray-500 mt-1">{proj.description}</p>}
                  {proj.technologies && <p className="text-xs text-blue-600 mt-1">Tech: {proj.technologies}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No projects added yet.</p>
          )}
        </Card>
      </div>

      {/* Career match summary */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Career Match Summary
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-48 truncate">{rec.career_name}</span>
                <div className="flex-1"><ProgressBar value={rec.match_percentage} color={rec.match_percentage >= 70 ? 'green' : rec.match_percentage >= 50 ? 'yellow' : 'red'} /></div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">{rec.match_percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    cyan: 'bg-cyan-50 text-cyan-600',
  };
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </Card>
  );
}
