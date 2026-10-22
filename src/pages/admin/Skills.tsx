import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { Skill } from '@/types';
import { GraduationCap, Plus, X, Edit2, Trash2, Save } from 'lucide-react';

export function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ name: '', category: 'technical', description: '' });

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    const { data } = await supabase.from('skills').select('*').order('category').order('name');
    setSkills(data as Skill[] || []);
    setLoading(false);
  }

  function startNew() { setEditing(null); setForm({ name: '', category: 'technical', description: '' }); setShowForm(true); }
  function startEdit(skill: Skill) { setEditing(skill); setForm({ name: skill.name, category: skill.category, description: skill.description || '' }); setShowForm(true); }

  async function handleSave() {
    if (editing) {
      await supabase.from('skills').update(form).eq('id', editing.id);
    } else {
      await supabase.from('skills').insert(form);
    }
    setShowForm(false); loadSkills();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this skill?')) return;
    await supabase.from('skills').delete().eq('id', id);
    loadSkills();
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading skills...</div>;

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm';
  const technical = skills.filter((s) => s.category === 'technical');
  const soft = skills.filter((s) => s.category === 'soft');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Management</h1>
          <p className="text-gray-500 mt-1">Manage technical and soft skills</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {showForm && (
        <Card className="p-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Skill' : 'New Skill'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}><option value="technical">Technical</option><option value="soft">Soft</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Technical Skills ({technical.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {technical.map((skill) => (
            <div key={skill.id} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between group">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{skill.name}</h3>
                <p className="text-xs text-gray-400 truncate">{skill.description}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => startEdit(skill)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(skill.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Soft Skills ({soft.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {soft.map((skill) => (
            <div key={skill.id} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between group">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{skill.name}</h3>
                <p className="text-xs text-gray-400 truncate">{skill.description}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => startEdit(skill)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(skill.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {skills.length === 0 && !showForm && (
        <Card className="p-8"><EmptyState icon={GraduationCap} title="No skills" description="Add skills for career matching." /></Card>
      )}
    </div>
  );
}
