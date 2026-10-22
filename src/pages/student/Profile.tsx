import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui';
import type { Profile, ProjectEntry } from '@/types';
import { UserCircle, Plus, X, Save, CheckCircle2, BookOpen, Award, Briefcase, Target } from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Agriculture', 'Business Administration', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'];
const CAREER_DOMAINS = ['Software Development', 'Data Analytics', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'UI/UX', 'Digital Marketing', 'Business Analytics', 'Agriculture Technology'];

export function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [projectInput, setProjectInput] = useState<ProjectEntry>({ title: '', description: '', technologies: '' });

  const [form, setForm] = useState({
    full_name: '', department: '', year: '', cgpa: '', academic_percentage: '',
    preferred_career_domain: '', career_goal: '', previous_experience: '',
    technical_skills: [] as string[], soft_skills: [] as string[],
    interests: [] as string[], certifications: [] as string[],
    projects: [] as ProjectEntry[],
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        setForm({
          full_name: data.full_name || '',
          department: data.department || '',
          year: data.year || '',
          cgpa: data.cgpa?.toString() || '',
          academic_percentage: data.academic_percentage?.toString() || '',
          preferred_career_domain: data.preferred_career_domain || '',
          career_goal: data.career_goal || '',
          previous_experience: data.previous_experience || '',
          technical_skills: data.technical_skills || [],
          soft_skills: data.soft_skills || [],
          interests: data.interests || [],
          certifications: data.certifications || [],
          projects: data.projects || [],
        });
      }
      setLoading(false);
    })();
  }, [user]);

  function updateForm(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function addSkill(field: 'technical_skills' | 'soft_skills' | 'interests' | 'certifications', value: string) {
    if (!value.trim()) return;
    updateForm(field, [...(form[field] as string[]), value.trim()]);
  }

  function removeSkill(field: 'technical_skills' | 'soft_skills' | 'interests' | 'certifications', index: number) {
    updateForm(field, (form[field] as string[]).filter((_, i) => i !== index));
  }

  function addProject() {
    if (!projectInput.title.trim()) return;
    updateForm('projects', [...form.projects, { ...projectInput }]);
    setProjectInput({ title: '', description: '', technologies: '' });
  }

  function removeProject(index: number) {
    updateForm('projects', form.projects.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: form.full_name,
      department: form.department || null,
      year: form.year || null,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      academic_percentage: form.academic_percentage ? parseFloat(form.academic_percentage) : null,
      preferred_career_domain: form.preferred_career_domain || null,
      career_goal: form.career_goal || null,
      previous_experience: form.previous_experience || null,
      technical_skills: form.technical_skills,
      soft_skills: form.soft_skills,
      interests: form.interests,
      certifications: form.certifications,
      projects: form.projects,
      updated_at: new Date().toISOString(),
    };

    if (profile) {
      await supabase.from('student_profiles').update(payload).eq('user_id', user.id);
    } else {
      await supabase.from('student_profiles').insert({ ...payload, email: user.email });
    }

    // Also sync skills to student_skills table
    await supabase.from('student_skills').delete().eq('user_id', user.id);
    const skillRows = form.technical_skills.map((s) => ({
      user_id: user.id, skill_name: s, proficiency: 60, category: 'technical',
    }));
    const softSkillRows = form.soft_skills.map((s) => ({
      user_id: user.id, skill_name: s, proficiency: 60, category: 'soft',
    }));
    if (skillRows.length > 0) await supabase.from('student_skills').insert(skillRows);
    if (softSkillRows.length > 0) await supabase.from('student_skills').insert(softSkillRows);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Complete your profile for better career recommendations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Basic Info */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <UserCircle className="w-5 h-5 text-blue-600" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} className={inputClass} placeholder="John Doe" />
          </Field>
          <Field label="Department">
            <select value={form.department} onChange={(e) => updateForm('department', e.target.value)} className={inputClass}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <select value={form.year} onChange={(e) => updateForm('year', e.target.value)} className={inputClass}>
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="CGPA (out of 10)">
            <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={(e) => updateForm('cgpa', e.target.value)} className={inputClass} placeholder="8.5" />
          </Field>
          <Field label="Academic Percentage (%)">
            <input type="number" step="0.01" min="0" max="100" value={form.academic_percentage} onChange={(e) => updateForm('academic_percentage', e.target.value)} className={inputClass} placeholder="85" />
          </Field>
          <Field label="Preferred Career Domain">
            <select value={form.preferred_career_domain} onChange={(e) => updateForm('preferred_career_domain', e.target.value)} className={inputClass}>
              <option value="">Select domain</option>
              {CAREER_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Skills & Interests
        </h2>
        <div className="space-y-4">
          <TagInput
            label="Technical Skills"
            icon={BookOpen}
            items={form.technical_skills}
            input={skillInput}
            setInput={setSkillInput}
            onAdd={() => { addSkill('technical_skills', skillInput); setSkillInput(''); }}
            onRemove={(i) => removeSkill('technical_skills', i)}
            placeholder="e.g., Python, SQL, React"
          />
          <TagInput
            label="Soft Skills"
            icon={Target}
            items={form.soft_skills}
            input={softSkillInput}
            setInput={setSoftSkillInput}
            onAdd={() => { addSkill('soft_skills', softSkillInput); setSoftSkillInput(''); }}
            onRemove={(i) => removeSkill('soft_skills', i)}
            placeholder="e.g., Communication, Leadership"
          />
          <TagInput
            label="Interests"
            icon={Target}
            items={form.interests}
            input={interestInput}
            setInput={setInterestInput}
            onAdd={() => { addSkill('interests', interestInput); setInterestInput(''); }}
            onRemove={(i) => removeSkill('interests', i)}
            placeholder="e.g., Data Science, Web Development"
          />
          <TagInput
            label="Certifications"
            icon={Award}
            items={form.certifications}
            input={certInput}
            setInput={setCertInput}
            onAdd={() => { addSkill('certifications', certInput); setCertInput(''); }}
            onRemove={(i) => removeSkill('certifications', i)}
            placeholder="e.g., AWS Certified, Google Data Analytics"
          />
        </div>
      </Card>

      {/* Projects */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Projects
        </h2>
        <div className="space-y-3 mb-4">
          {form.projects.length > 0 ? (
            form.projects.map((p, i) => (
              <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                  {p.technologies && <p className="text-xs text-blue-600 mt-2">Tech: {p.technologies}</p>}
                </div>
                <button onClick={() => removeProject(i)} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No projects added yet.</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={projectInput.title} onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })} className={inputClass} placeholder="Project title" />
          <input value={projectInput.description} onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })} className={inputClass} placeholder="Brief description" />
          <div className="flex gap-2">
            <input value={projectInput.technologies} onChange={(e) => setProjectInput({ ...projectInput, technologies: e.target.value })} className={inputClass} placeholder="Technologies" />
            <button onClick={addProject} className="px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Career Goals */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-blue-600" />
          Career Goals & Experience
        </h2>
        <div className="space-y-4">
          <Field label="Career Goal">
            <textarea value={form.career_goal} onChange={(e) => updateForm('career_goal', e.target.value)} rows={2} className={inputClass} placeholder="e.g., Become a Data Scientist at a tech company" />
          </Field>
          <Field label="Previous Experience">
            <textarea value={form.previous_experience} onChange={(e) => updateForm('previous_experience', e.target.value)} rows={3} className={inputClass} placeholder="Internships, work experience, relevant activities..." />
          </Field>
        </div>
      </Card>
    </div>
  );
}

const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TagInput({ label, icon: Icon, items, input, setInput, onAdd, onRemove, placeholder }: {
  label: string; icon: React.ElementType; items: string[]; input: string;
  setInput: (v: string) => void; onAdd: () => void; onRemove: (i: number) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          className={inputClass}
          placeholder={placeholder}
        />
        <button onClick={onAdd} className="px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex-shrink-0">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
            {item}
            <button onClick={() => onRemove(i)} className="text-blue-400 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
