import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateRecommendations } from '@/lib/aiService';
import { Card, Badge, EmptyState, ProgressBar } from '@/components/ui';
import type { Profile, Career, AssessmentAnswer, CategoryScore, CareerRecommendation, StudentSkill } from '@/types';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, BookOpen, Briefcase } from 'lucide-react';

export function Recommendations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [hasData, setHasData] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('match_percentage', { ascending: false });
      setRecommendations(data as CareerRecommendation[] || []);
      if (data && data.length > 0) {
        setSelectedCareer(data[0].career_name);
        setHasData(true);
      }
      const { data: prof } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile(prof as Profile | null);
      setLoading(false);
    })();
  }, [user]);

  async function handleGenerate() {
    if (!user) return;
    setGenerating(true);

    const [profileRes, answersRes, careersRes, skillsRes] = await Promise.all([
      supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('assessment_answers').select('*').eq('user_id', user.id),
      supabase.from('careers').select('*'),
      supabase.from('student_skills').select('*').eq('user_id', user.id),
    ]);

    const prof = profileRes.data as Profile | null;
    const allAnswers = answersRes.data as AssessmentAnswer[] || [];
    const careers = careersRes.data as Career[] || [];
    const skills = skillsRes.data as StudentSkill[] || [];

    const catMap = new Map<string, number>();
    allAnswers.forEach((a) => catMap.set(a.category, (catMap.get(a.category) || 0) + a.answer_value));
    const categoryScores: CategoryScore[] = Array.from(catMap.entries()).map(([cat, score]) => ({
      category: cat, score, maxScore: 15,
    }));

    const results = await generateRecommendations({
      profile: prof, categoryScores, careers, studentSkills: skills.map((s) => ({ skill_name: s.skill_name, proficiency: s.proficiency })),
    });

    await supabase.from('career_recommendations').delete().eq('user_id', user.id);
    if (results.length > 0) {
      await supabase.from('career_recommendations').insert(
        results.map((r) => ({ user_id: user.id, ...r })),
      );
    }

    const { data: newRecs } = await supabase
      .from('career_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('match_percentage', { ascending: false });
    setRecommendations(newRecs as CareerRecommendation[] || []);
    setSelectedCareer(newRecs?.[0]?.career_name || null);
    setHasData(true);
    setGenerating(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const selected = recommendations.find((r) => r.career_name === selectedCareer);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Career Recommendations</h1>
          <p className="text-gray-500 mt-1">Personalized career paths based on your profile and assessment</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50"
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating...' : 'Generate Recommendations'}
        </button>
      </div>

      {!hasData && !generating && (
        <Card className="p-8">
          <EmptyState
            icon={Sparkles}
            title="No recommendations yet"
            description="Complete your profile and take the assessment, then click 'Generate Recommendations' to get AI-powered career matches tailored to you."
          />
        </Card>
      )}

      {generating && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Analyzing your profile and generating personalized recommendations...</p>
          </div>
        </Card>
      )}

      {hasData && recommendations.length > 0 && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Top Matches</h2>
            {recommendations.map((rec, i) => (
              <button
                key={rec.id}
                onClick={() => setSelectedCareer(rec.career_name)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                  selectedCareer === rec.career_name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                    }`}>{i + 1}</span>
                    <span className="font-semibold text-gray-900 text-sm">{rec.career_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={rec.match_percentage} color={rec.match_percentage >= 70 ? 'green' : rec.match_percentage >= 50 ? 'yellow' : 'red'} />
                  <span className="text-sm font-bold text-gray-700">{rec.match_percentage}%</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detail view */}
          <div className="lg:col-span-2">
            {selected && (
              <Card className="p-6 animate-scaleIn">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.career_name}</h2>
                    <p className="text-sm text-gray-500 mt-2">{selected.reason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-4xl font-bold ${selected.match_percentage >= 70 ? 'text-green-600' : selected.match_percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {selected.match_percentage}%
                    </div>
                    <div className="text-xs text-gray-400">Match Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800 text-sm">Matching Skills ({selected.matching_skills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.matching_skills.length > 0 ? selected.matching_skills.map((s) => (
                        <Badge key={s} color="green">{s}</Badge>
                      )) : <span className="text-xs text-gray-400">No matching skills yet</span>}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-800 text-sm">Skills to Improve ({selected.missing_skills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.missing_skills.length > 0 ? selected.missing_skills.map((s) => (
                        <Badge key={s} color="orange">{s}</Badge>
                      )) : <span className="text-xs text-gray-400">You have all required skills!</span>}
                    </div>
                  </div>
                </div>

                {selected.growth_info && (
                  <div className="p-4 bg-blue-50 rounded-xl mb-6 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 text-sm mb-1">Career Growth</h3>
                      <p className="text-sm text-blue-700">{selected.growth_info}</p>
                    </div>
                  </div>
                )}

                {selected.recommended_resources && selected.recommended_resources.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Recommended Learning Resources
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selected.recommended_resources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                          <span className="text-sm font-medium text-gray-700">{r.title}</span>
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selected.suggested_projects && selected.suggested_projects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      Suggested Projects
                    </h3>
                    <div className="space-y-2">
                      {selected.suggested_projects.map((p, i) => (
                        <div key={i} className="p-3 border border-gray-100 rounded-xl">
                          <h4 className="font-medium text-gray-900 text-sm">{p.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
