import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, Badge, EmptyState, ProgressBar } from '@/components/ui';
import type { CareerRecommendation, LearningRoadmap, RoadmapProgress } from '@/types';
import { Map, CheckCircle2, Circle, Lock, BookOpen, Target, ExternalLink } from 'lucide-react';

export function Roadmap() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [progress, setProgress] = useState<RoadmapProgress[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: recs } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('match_percentage', { ascending: false });
      setRecommendations(recs as CareerRecommendation[] || []);
      if (recs && recs.length > 0) setSelectedCareer(recs[0].career_name);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedCareer) return;
    (async () => {
      const [rmRes, progRes] = await Promise.all([
        supabase.from('learning_roadmaps').select('*').eq('career_name', selectedCareer).order('phase_number'),
        supabase.from('roadmap_progress').select('*').eq('user_id', user.id).eq('career_name', selectedCareer),
      ]);
      setRoadmaps(rmRes.data as LearningRoadmap[] || []);
      setProgress(progRes.data as RoadmapProgress[] || []);
    })();
  }, [user, selectedCareer]);

  async function togglePhase(phaseNumber: number) {
    if (!user || !selectedCareer) return;
    const existing = progress.find((p) => p.phase_number === phaseNumber);
    if (existing) {
      const newCompleted = !existing.completed;
      await supabase.from('roadmap_progress')
        .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
        .eq('id', existing.id);
    } else {
      await supabase.from('roadmap_progress').insert({
        user_id: user.id,
        career_name: selectedCareer,
        phase_number: phaseNumber,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }
    const { data } = await supabase.from('roadmap_progress').select('*').eq('user_id', user.id).eq('career_name', selectedCareer);
    setProgress(data as RoadmapProgress[] || []);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  if (recommendations.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState icon={Map} title="No roadmap available" description="Generate career recommendations first to access personalized learning roadmaps." />
      </Card>
    );
  }

  const completedCount = progress.filter((p) => p.completed).length;
  const totalPhases = roadmaps.length;
  const overallPct = totalPhases > 0 ? Math.round((completedCount / totalPhases) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Roadmap</h1>
        <p className="text-gray-500 mt-1">Step-by-step path to your target career</p>
      </div>

      {/* Career selector */}
      <div className="flex flex-wrap gap-2">
        {recommendations.slice(0, 5).map((rec) => (
          <button
            key={rec.id}
            onClick={() => setSelectedCareer(rec.career_name)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCareer === rec.career_name
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {rec.career_name}
          </button>
        ))}
      </div>

      {/* Progress overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Goal: {selectedCareer}</h2>
            <p className="text-sm text-gray-500 mt-1">{completedCount} of {totalPhases} phases completed</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{overallPct}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>
        <ProgressBar value={overallPct} color="blue" />
      </Card>

      {/* Roadmap timeline */}
      <div className="space-y-4">
        {roadmaps.map((phase, idx) => {
          const phaseProgress = progress.find((p) => p.phase_number === phase.phase_number);
          const isCompleted = phaseProgress?.completed || false;
          const isLocked = idx > 0 && !progress.find((p) => p.phase_number === roadmaps[idx - 1].phase_number)?.completed;

          return (
            <Card key={phase.id} className={`p-6 transition ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
              <div className="flex items-start gap-4">
                {/* Phase indicator */}
                <button
                  onClick={() => !isLocked && togglePhase(phase.phase_number)}
                  disabled={isLocked}
                  className="flex-shrink-0"
                >
                  {isLocked ? (
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  ) : isCompleted ? (
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600 transition">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 border-2 border-blue-300 bg-blue-50 rounded-xl flex items-center justify-center hover:border-blue-500 transition">
                      <Circle className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                </button>

                {/* Phase content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge color={isCompleted ? 'green' : 'blue'}>Phase {phase.phase_number}</Badge>
                    {isCompleted && <Badge color="green">Completed</Badge>}
                    {isLocked && <Badge color="gray">Locked</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{phase.phase_title}</h3>

                  {phase.objectives && phase.objectives.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Learning Objectives</p>
                      <ul className="space-y-1">
                        {phase.objectives.map((obj, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <Target className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phase.skills && phase.skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {phase.skills.map((s) => <Badge key={s} color="cyan">{s}</Badge>)}
                      </div>
                    </div>
                  )}

                  {phase.resources && phase.resources.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Suggested Resources
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phase.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm">
                            <span className="text-gray-700 truncate">{r.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.project_task && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs font-medium text-blue-600 uppercase mb-1">Project / Task</p>
                      <p className="text-sm text-blue-800">{phase.project_task}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
