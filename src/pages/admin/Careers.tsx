import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { Career } from '@/types';
import { BookOpen, Plus, X, Edit2, Trash2, Save } from 'lucide-react';

export function AdminCareers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Career | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', required_skills: '', recommended_education: '',
    typical_projects: '', related_careers: '', growth_outlook: '', avg_salary: '',
  });

  useEffect(() => {
    loadCareers();
  }, []);

  async function loadCareers() {
    const { data } = await supabase.from('careers').select('*').order('category');
    setCareers(data as Career[] || []);
    setLoading(false);
  }

  function startEdit(career: Career) {
    setEditing(career);
    setForm({
      name: career.name,
      category: career.category,
      description: career.description || '',
      required_skills: career.required_skills?.join(', ') || '',
      recommended_education: career.recommended_education || '',
      typical_projects: career.typical_projects?.join(', ') || '',
      related_careers: career.related_careers?.join(', ') || '',
      growth_outlook: career.growth_outlook || '',
      avg_salary: career.avg_salary || '',
    });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm({ name: '', category: '', description: '', required_skills: '', recommended_education: '', typical_projects: '', related_careers: '', growth_outlook: '', avg_salary: '' });
    setShowForm(true);
  }

  async function handleSave() {
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      required_skills: form.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
      recommended_education: form.recommended_education || null,
      typical_projects: form.typical_projects.split(',').map((s) => s.trim()).filter(Boolean),
      related_careers: form.related_careers.split(',').map((s) => s.trim()).filter(Boolean),
      growth_outlook: form.growth_outlook || null,
      avg_salary: form.avg_salary || null,
    };

    if (editing) {
      await supabase.from('careers').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('careers').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    loadCareers();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this career path? This cannot be undone.')) return;
    await supabase.from('careers').delete().eq('id', id);
    loadCareers();
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading careers...</div>;

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Paths</h1>
          <p className="text-gray-500 mt-1">Manage career path listings</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
          <Plus className="w-4 h-4" /> Add Career
        </button>
      </div>

      {showForm && (
        <Card className="p-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Career' : 'New Career'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Required Skills (comma-separated)</label><input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Recommended Education</label><input value={form.recommended_education} onChange={(e) => setForm({ ...form, recommended_education: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Typical Projects (comma-separated)</label><input value={form.typical_projects} onChange={(e) => setForm({ ...form, typical_projects: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Related Careers (comma-separated)</label><input value={form.related_careers} onChange={(e) => setForm({ ...form, related_careers: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Growth Outlook</label><input value={form.growth_outlook} onChange={(e) => setForm({ ...form, growth_outlook: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Average Salary</label><input value={form.avg_salary} onChange={(e) => setForm({ ...form, avg_salary: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      {careers.length === 0 && !showForm ? (
        <Card className="p-8"><EmptyState icon={BookOpen} title="No careers" description="Add career paths for students to explore." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careers.map((career) => (
            <Card key={career.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{career.name}</h3>
                  <Badge color="blue">{career.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(career)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(career.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{career.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {career.required_skills?.slice(0, 5).map((s) => <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{s}</span>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
