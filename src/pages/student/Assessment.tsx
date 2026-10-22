import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { AssessmentQuestion, AssessmentAnswer, CategoryScore } from '@/types';
import { ClipboardList, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#4f46e5'];

export function Assessment() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [existingAnswers, setExistingAnswers] = useState<AssessmentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [qRes, aRes] = await Promise.all([
        supabase.from('assessment_questions').select('*').order('category'),
        supabase.from('assessment_answers').select('*').eq('user_id', user.id),
      ]);
      setQuestions(qRes.data as AssessmentQuestion[] || []);
      setExistingAnswers(aRes.data as AssessmentAnswer[] || []);
      if (aRes.data && aRes.data.length > 0) {
        computeScores(aRes.data as AssessmentAnswer[]);
        setSubmitted(true);
      }
      setLoading(false);
    })();
  }, [user]);

  function computeScores(allAnswers: AssessmentAnswer[]) {
    const catMap = new Map<string, number>();
    allAnswers.forEach((a) => {
      catMap.set(a.category, (catMap.get(a.category) || 0) + a.answer_value);
    });
    const scores: CategoryScore[] = Array.from(catMap.entries()).map(([cat, score]) => ({
      category: cat,
      score,
      maxScore: 15,
    }));
    setCategoryScores(scores);
  }

  function selectAnswer(questionId: string, value: number) {
    setAnswers({ ...answers, [questionId]: value });
  }

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);

    await supabase.from('assessment_answers').delete().eq('user_id', user.id);

    const rows = questions.map((q) => ({
      user_id: user.id,
      question_id: q.id,
      answer_value: answers[q.id] || 3,
      category: q.category,
    }));

    await supabase.from('assessment_answers').insert(rows);
    const { data: newAnswers } = await supabase.from('assessment_answers').select('*').eq('user_id', user.id);
    setExistingAnswers(newAnswers as AssessmentAnswer[] || []);
    computeScores(newAnswers as AssessmentAnswer[] || []);
    setSubmitted(true);
    setSubmitting(false);
  }

  async function retakeAssessment() {
    setSubmitted(false);
    setAnswers({});
    setCurrentIndex(0);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading assessment...</div>;

  if (submitted) {
    const radarData = categoryScores.map((cs) => ({
      category: cs.category.length > 15 ? cs.category.slice(0, 13) + '...' : cs.category,
      score: (cs.score / cs.maxScore) * 100,
    }));
    const sortedScores = [...categoryScores].sort((a, b) => b.score - a.score);
    const avgScore = categoryScores.length > 0
      ? Math.round(categoryScores.reduce((sum, cs) => sum + (cs.score / cs.maxScore) * 100, 0) / categoryScores.length)
      : 0;

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
            <p className="text-gray-500 mt-1">Your aptitude profile across key categories</p>
          </div>
          <button onClick={retakeAssessment} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-700">
            <RefreshCw className="w-4 h-4" /> Retake
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Aptitude Radar</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-blue-600 font-medium">Overall Assessment Score</div>
              <div className="text-3xl font-bold text-blue-700 mt-1">{avgScore}%</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={radarData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#6b7280' }} width={80} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {radarData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Detailed Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedScores.map((cs, i) => {
              const pct = Math.round((cs.score / cs.maxScore) * 100);
              const strength = pct >= 75 ? 'Strong' : pct >= 50 ? 'Moderate' : 'Developing';
              const color = pct >= 75 ? 'green' : pct >= 50 ? 'yellow' : 'red';
              return (
                <div key={cs.category} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{cs.category}</span>
                    <Badge color={color}>{strength}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  if (!currentQ) return <EmptyState icon={ClipboardList} title="No questions available" description="Assessment questions haven't been set up yet." />;

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Assessment</h1>
        <p className="text-gray-500 mt-1">Answer honestly to get the most accurate career recommendations</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-500">{answeredCount} / {questions.length}</span>
      </div>

      <Card className="p-8">
        <div className="mb-2">
          <Badge color="blue">{currentQ.category}</Badge>
        </div>
        <p className="text-xs text-gray-400 mb-4">Question {currentIndex + 1} of {questions.length}</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{currentQ.question}</h2>

        <div className="space-y-2">
          {currentQ.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                selectAnswer(currentQ.id, opt.value);
                if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between ${
                answers[currentQ.id] === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-100 hover:border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{opt.text}</span>
              {answers[currentQ.id] === opt.value && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-30 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
              {!submitting && <CheckCircle2 className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
