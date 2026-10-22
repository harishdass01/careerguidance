import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, ProgressBar, Badge } from '@/components/ui';
import {
  Users, UserCheck, BookOpen, ClipboardList, TrendingUp, Award,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#4f46e5'];

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCareers: 0,
    totalQuestions: 0,
    avgAssessment: 0,
  });
  const [careerStats, setCareerStats] = useState<{ name: string; count: number }[]>([]);
  const [deptStats, setDeptStats] = useState<{ department: string; count: number }[]>([]);
  const [skillGaps, setSkillGaps] = useState<{ skill: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [studentsRes, careersRes, questionsRes, recommendationsRes, profilesRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('role', 'student'),
        supabase.from('careers').select('id'),
        supabase.from('assessment_questions').select('id'),
        supabase.from('career_recommendations').select('career_name'),
        supabase.from('student_profiles').select('department'),
      ]);

      const totalStudents = studentsRes.data?.length || 0;
      const totalCareers = careersRes.data?.length || 0;
      const totalQuestions = questionsRes.data?.length || 0;

      const recCounts = new Map<string, number>();
      (recommendationsRes.data || []).forEach((r: { career_name: string }) => {
        recCounts.set(r.career_name, (recCounts.get(r.career_name) || 0) + 1);
      });
      const careerStatsData = Array.from(recCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const deptCounts = new Map<string, number>();
      (profilesRes.data || []).forEach((p: { department: string | null }) => {
        const dept = p.department || 'Unspecified';
        deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
      });
      const deptStatsData = Array.from(deptCounts.entries()).map(([department, count]) => ({ department, count }));

      // Skill gaps from recommendations
      const { data: allRecs } = await supabase.from('career_recommendations').select('missing_skills');
      const gapCounts = new Map<string, number>();
      (allRecs || []).forEach((r: { missing_skills: string[] }) => {
        (r.missing_skills || []).forEach((s: string) => {
          gapCounts.set(s, (gapCounts.get(s) || 0) + 1);
        });
      });
      const skillGapsData = Array.from(gapCounts.entries())
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalStudents,
        activeStudents: totalStudents,
        totalCareers,
        totalQuestions,
        avgAssessment: 0,
      });
      setCareerStats(careerStatsData);
      setDeptStats(deptStatsData);
      setSkillGaps(skillGapsData);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={UserCheck} label="Active Students" value={stats.activeStudents} color="green" />
        <StatCard icon={BookOpen} label="Career Paths" value={stats.totalCareers} color="cyan" />
        <StatCard icon={ClipboardList} label="Assessment Questions" value={stats.totalQuestions} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most selected careers */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Most Recommended Careers
          </h2>
          {careerStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={careerStats} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={100} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {careerStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No recommendation data yet.</p>}
        </Card>

        {/* Department-wise stats */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            Department-wise Distribution
          </h2>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deptStats} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name as string}>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No student data yet.</p>}
        </Card>
      </div>

      {/* Most common skill gaps */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-blue-600" />
          Most Common Skill Gaps
        </h2>
        {skillGaps.length > 0 ? (
          <div className="space-y-3">
            {skillGaps.map((gap, i) => {
              const maxCount = skillGaps[0].count;
              const pct = Math.round((gap.count / maxCount) * 100);
              return (
                <div key={gap.skill}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{gap.skill}</span>
                    <Badge color={i < 3 ? 'red' : i < 6 ? 'yellow' : 'gray'}>{gap.count} students</Badge>
                  </div>
                  <ProgressBar value={pct} color={i < 3 ? 'red' : i < 6 ? 'yellow' : 'blue'} />
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-12">No skill gap data yet.</p>}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    indigo: 'bg-indigo-50 text-indigo-600',
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
