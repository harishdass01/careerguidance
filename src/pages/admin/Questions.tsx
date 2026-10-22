import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { AssessmentQuestion } from '@/types';
import { Settings, Plus, X, Edit2, Trash2, Save } from 'lucide-react';

const CATEGORIES = ['Programming', 'Analytical Thinking', 'Creativity', 'Communication', 'Leadership', 'Mathematics', 'Technical Interests', 'Business/Management', 'Agriculture/Technology', 'Problem Solving'];

export function AdminQuestions() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AssessmentQuestion | null>(null);
  const [form, setForm] = useState({ question: '', category: 'Programming' });

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    const { data } = await supabase.from('assessment_questions').select('*').order('category');
    setQuestions(data as AssessmentQuestion[] || []);
    setLoading(false);
  }

  function startNew() { setEditing(null); setForm({ question: '', category: 'Programming' }); setShowForm(true); }
  function startEdit(q: AssessmentQuestion) { setEditing(q); setForm({ question: q.question, category: q.category }); setShowForm(true); }

  async function handleSave() {
    if (editing) {
      await supabase.from('assessment_questions').update(form).eq('id', editing.id);
    } else {
      await supabase.from('assessment_questions').insert(form);
    }
    setShowForm(false); loadQuestions();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return;
    await supabase.from('assessment_questions').delete().eq('id', id);
    loadQuestions();
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading questions...</div>;

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm';
  const grouped = CATEGORIES.map((cat) => ({ category: cat, items: questions.filter((q) => q.category === cat) })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Questions</h1>
          <p className="text-gray-500 mt-1">Manage career assessment questions</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {showForm && (
        <Card className="p-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Question' : 'New Question'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Question</label><textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={2} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"><Save className="w-4 h-4" /> Save</button>
          </div>
        </Card>
      )}

      {questions.length === 0 && !showForm ? (
        <Card className="p-8"><EmptyState icon={Settings} title="No questions" description="Add assessment questions for students." /></Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.category}>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Badge color="blue">{group.category}</Badge>
                <span className="text-sm text-gray-400">({group.items.length} questions)</span>
              </h2>
              <div className="space-y-2">
                {group.items.map((q) => (
                  <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-100 flex items-start justify-between group">
                    <p className="text-sm text-gray-700 flex-1">{q.question}</p>
                    <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
