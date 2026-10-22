import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, ProgressBar, Badge, EmptyState } from '@/components/ui';
import {
  TrendingUp, Users, Award, BookOpen,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#4f46e5'];

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [careerRecStats, setCareerRecStats] = useState<{ name: string; count: number; avgMatch: number }[]>([]);
  const [deptStats, setDeptStats] = useState<{ department: string; count: number }[]>([]);
  const [skillGapStats, setSkillGapStats] = useState<{ skill: string; count: number }[]>([]);
  const [totalRecs, setTotalRecs] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgMatch, setAvgMatch] = useState(0);

  useEffect(() => {
    (async () => {
      const [recRes, profileRes] = await Promise.all([
        supabase.from('career_recommendations').select('career_name, match_percentage'),
        supabase.from('student_profiles').select('department'),
      ]);

      const recs = recRes.data as { career_name: string; match_percentage: number }[] || [];
      const profiles = profileRes.data as { department: string | null }[] || [];

      setTotalRecs(recs.length);
      setTotalStudents(profiles.length);
      setAvgMatch(recs.length > 0 ? Math.round(recs.reduce((sum, r) => sum + r.match_percentage, 0) / recs.length) : 0);

      const careerMap = new Map<string, { count: number; totalMatch: number }>();
      recs.forEach((r) => {
        const cur = careerMap.get(r.career_name) || { count: 0, totalMatch: 0 };
        careerMap.set(r.career_name, { count: cur.count + 1, totalMatch: cur.totalMatch + r.match_percentage });
      });
      setCareerRecStats(
        Array.from(careerMap.entries())
          .map(([name, v]) => ({ name, count: v.count, avgMatch: Math.round(v.totalMatch / v.count) }))
          .sort((a, b) => b.count - a.count)
      );

      const deptMap = new Map<string, number>();
      profiles.forEach((p) => deptMap.set(p.department || 'Unspecified', (deptMap.get(p.department || 'Unspecified') || 0) + 1));
      setDeptStats(Array.from(deptMap.entries()).map(([department, count]) => ({ department, count })));

      const { data: allRecs } = await supabase.from('career_recommendations').select('missing_skills');
      const gapMap = new Map<string, number>();
      (allRecs || []).forEach((r: { missing_skills: string[] }) => {
        (r.missing_skills || []).forEach((s: string) => gapMap.set(s, (gapMap.get(s) || 0) + 1));
      });
      setSkillGapStats(Array.from(gapMap.entries()).map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, 15));

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Comprehensive statistics and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3"><Users className="w-5 h-5 text-blue-600" /></div>
          <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
          <div className="text-sm text-gray-500">Students</div>
        </Card>
        <Card className="p-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div className="text-2xl font-bold text-gray-900">{totalRecs}</div>
          <div className="text-sm text-gray-500">Recommendations</div>
        </Card>
        <Card className="p-5">
          <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-3"><Award className="w-5 h-5 text-cyan-600" /></div>
          <div className="text-2xl font-bold text-gray-900">{avgMatch}%</div>
          <div className="text-sm text-gray-500">Avg Match Score</div>
        </Card>
        <Card className="p-5">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-orange-600" /></div>
          <div className="text-2xl font-bold text-gray-900">{skillGapStats.length}</div>
          <div className="text-sm text-gray-500">Unique Skill Gaps</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Career Recommendation Statistics</h2>
          {careerRecStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={careerRecStats} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={100} />
                <Tooltip />
                <Bar dataKey="count" name="Recommendations" radius={[0, 4, 4, 0]}>
                  {careerRecStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data available.</p>}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Department Distribution</h2>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={deptStats} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={110} label={({ name }) => name as string}>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-12">No data available.</p>}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Average Match Score by Career</h2>
        {careerRecStats.length > 0 ? (
          <div className="space-y-3">
            {careerRecStats.map((stat, i) => (
              <div key={stat.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{stat.name}</span>
                  <span className="text-gray-500">{stat.avgMatch}% avg ({stat.count} recommendations)</span>
                </div>
                <ProgressBar value={stat.avgMatch} color={i % 2 === 0 ? 'blue' : 'cyan'} />
              </div>
            ))}
          </div>
        ) : <EmptyState icon={TrendingUp} title="No data" description="No recommendation data available yet." />}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Most Common Skill Gaps Across Students</h2>
        {skillGapStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={skillGapStats} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="skill" tick={{ fontSize: 10, fill: '#6b7280' }} width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Students needing this skill" radius={[0, 4, 4, 0]} fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState icon={Award} title="No skill gap data" description="No skill gap data available yet." />}
      </Card>
    </div>
  );
}
