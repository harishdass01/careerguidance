import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState, ProgressBar } from '@/components/ui';
import type { CareerRecommendation, StudentSkill } from '@/types';
import { BarChart3, CheckCircle2, AlertCircle, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export function SkillGap() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [recRes, skillRes] = await Promise.all([
        supabase.from('career_recommendations').select('*').eq('user_id', user.id).order('match_percentage', { ascending: false }),
        supabase.from('student_skills').select('*').eq('user_id', user.id),
      ]);
      setRecommendations(recRes.data as CareerRecommendation[] || []);
      setStudentSkills(skillRes.data as StudentSkill[] || []);
      if (recRes.data && recRes.data.length > 0) setSelectedCareer(recRes.data[0].career_name);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  if (recommendations.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState icon={BarChart3} title="No skill gap analysis available" description="Generate career recommendations first to see your skill gap analysis." />
      </Card>
    );
  }

  const selected = recommendations.find((r) => r.career_name === selectedCareer) || recommendations[0];
  const skillMap = new Map(studentSkills.map((s) => [s.skill_name.toLowerCase(), s.proficiency]));

  const allSkills = [
    ...selected.matching_skills.map((s) => ({ name: s, level: skillMap.get(s.toLowerCase()) || 80, status: 'mastered' as const })),
    ...selected.missing_skills.map((s) => ({ name: s, level: skillMap.get(s.toLowerCase()) || 20, status: 'missing' as const })),
  ];

  const chartData = allSkills.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 10) + '...' : s.name,
    fullName: s.name,
    level: s.level,
    status: s.status,
  }));

  const masteredCount = selected.matching_skills.length;
  const missingCount = selected.missing_skills.length;
  const improveCount = allSkills.filter((s) => s.status === 'mastered' && s.level < 70).length;

  function getPriority(skill: string, index: number): 'High' | 'Medium' | 'Low' {
    if (index < 2) return 'High';
    if (index < 5) return 'Medium';
    return 'Low';
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
        <p className="text-gray-500 mt-1">Visual comparison of your current skills vs. required skills</p>
      </div>

      {/* Career selector */}
      <div className="flex flex-wrap gap-2">
        {recommendations.map((rec) => (
          <button
            key={rec.id}
            onClick={() => setSelectedCareer(rec.career_name)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCareer === rec.career_name
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {rec.career_name} ({rec.match_percentage}%)
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Skills Mastered</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{masteredCount}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Need Improvement</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{improveCount}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Missing Skills</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{missingCount}</div>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Current vs Required Skills — {selected.career_name}
        </h2>
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 50)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
                    <p className="font-semibold text-gray-900">{d.fullName}</p>
                    <p className="text-gray-500">Level: {d.level}%</p>
                    <p className="text-gray-500">Status: {d.status}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="level" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.status === 'mastered' ? '#059669' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" /> <span className="text-xs text-gray-600">Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" /> <span className="text-xs text-gray-600">Missing / Low</span>
          </div>
        </div>
      </Card>

      {/* Detailed breakdown */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Detailed Skill Breakdown</h2>
        <div className="space-y-4">
          {allSkills.map((skill, i) => (
            <div key={skill.name}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{skill.name}</span>
                  {skill.status === 'mastered' ? (
                    <Badge color="green">Mastered</Badge>
                  ) : (
                    <Badge color={getPriority(skill.name, i) === 'High' ? 'red' : getPriority(skill.name, i) === 'Medium' ? 'yellow' : 'gray'}>
                      {getPriority(skill.name, i)} Priority
                    </Badge>
                  )}
                </div>
                <span className="text-gray-500">{skill.level}%</span>
              </div>
              <ProgressBar value={skill.level} color={skill.status === 'mastered' ? 'green' : 'red'} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
