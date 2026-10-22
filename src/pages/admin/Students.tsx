import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { Profile } from '@/types';
import { Users, Search, Mail, GraduationCap } from 'lucide-react';

export function AdminStudents() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('student_profiles').select('*').order('created_at', { ascending: false });
      setStudents(data as Profile[] || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading students...</div>;

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q));
  });

  if (selectedStudent) {
    const profileCompletion = calculateCompletion(selectedStudent);
    return (
      <div className="space-y-6 animate-fadeIn">
        <button onClick={() => setSelectedStudent(null)} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to students
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedStudent.full_name || 'Unknown'}</h1>
          <p className="text-gray-500">{selectedStudent.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-sm text-gray-500">Department</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{selectedStudent.department || 'Not set'}</div>
          </Card>
          <Card className="p-5">
            <div className="text-sm text-gray-500">Year</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{selectedStudent.year || 'Not set'}</div>
          </Card>
          <Card className="p-5">
            <div className="text-sm text-gray-500">Profile Completion</div>
            <div className="text-lg font-semibold text-blue-600 mt-1">{profileCompletion}%</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Technical Skills</h2>
            <div className="flex flex-wrap gap-2">
              {selectedStudent.technical_skills?.length > 0 ? selectedStudent.technical_skills.map((s) => <Badge key={s} color="blue">{s}</Badge>) : <span className="text-sm text-gray-400">None</span>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Soft Skills</h2>
            <div className="flex flex-wrap gap-2">
              {selectedStudent.soft_skills?.length > 0 ? selectedStudent.soft_skills.map((s) => <Badge key={s} color="green">{s}</Badge>) : <span className="text-sm text-gray-400">None</span>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {selectedStudent.interests?.length > 0 ? selectedStudent.interests.map((s) => <Badge key={s} color="cyan">{s}</Badge>) : <span className="text-sm text-gray-400">None</span>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {selectedStudent.certifications?.length > 0 ? selectedStudent.certifications.map((s) => <Badge key={s} color="yellow">{s}</Badge>) : <span className="text-sm text-gray-400">None</span>}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Career Goal</h2>
          <p className="text-sm text-gray-600">{selectedStudent.career_goal || 'Not set'}</p>
        </Card>

        {selectedStudent.projects?.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Projects</h2>
            <div className="space-y-2">
              {selectedStudent.projects.map((p, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-900">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Students</h1>
        <p className="text-gray-500 mt-1">View and manage student profiles</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={Users} title="No students found" description={search ? "No students match your search." : "No students have registered yet."} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="text-left p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">{student.full_name?.[0]?.toUpperCase() || 'S'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{student.full_name || 'Unknown'}</h3>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {student.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <GraduationCap className="w-3.5 h-3.5" />
                {student.department || 'No department'} • {student.year || 'No year'}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Profile</span>
                  <span className="font-semibold text-blue-600">{calculateCompletion(student)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculateCompletion(student)}%` }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function calculateCompletion(profile: Profile): number {
  const fields = [profile.full_name, profile.department, profile.year, profile.cgpa, profile.academic_percentage, profile.preferred_career_domain, profile.career_goal, profile.previous_experience];
  const arrays = [profile.technical_skills, profile.soft_skills, profile.interests, profile.certifications, profile.projects];
  let filled = 0;
  fields.forEach((f) => { if (f !== null && f !== undefined && f !== '') filled++; });
  arrays.forEach((a) => { if (a && a.length > 0) filled++; });
  return Math.round((filled / 13) * 100);
}
