import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge } from '@/components/ui';
import type { Career, Project, Certification, LearningRoadmap } from '@/types';
import {
  Compass, BookOpen, GraduationCap, Briefcase, TrendingUp, ArrowLeft,
  CheckCircle2, Award, Map,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Software Development': 'bg-blue-50 text-blue-700 border-blue-200',
  'Data Analytics': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Data Science': 'bg-green-50 text-green-700 border-green-200',
  'Artificial Intelligence': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Cybersecurity': 'bg-red-50 text-red-700 border-red-200',
  'Cloud Computing': 'bg-teal-50 text-teal-700 border-teal-200',
  'UI/UX': 'bg-pink-50 text-pink-700 border-pink-200',
  'Digital Marketing': 'bg-orange-50 text-orange-700 border-orange-200',
  'Business Analytics': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Agriculture Technology': 'bg-lime-50 text-lime-700 border-lime-200',
};

export function CareerExplorer() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  useEffect(() => {
    (async () => {
      const [cRes, pRes, certRes, rRes] = await Promise.all([
        supabase.from('careers').select('*').order('category'),
        supabase.from('projects').select('*'),
        supabase.from('certifications').select('*'),
        supabase.from('learning_roadmaps').select('*').order('phase_number'),
      ]);
      setCareers(cRes.data as Career[] || []);
      setProjects(pRes.data as Project[] || []);
      setCertifications(certRes.data as Certification[] || []);
      setRoadmaps(rRes.data as LearningRoadmap[] || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading careers...</div>;

  // Detail view
  if (selectedCareer) {
    const careerProjects = projects.filter((p) => p.career_name === selectedCareer.name);
    const careerCerts = certifications.filter((c) => c.career_name === selectedCareer.name);
    const careerRoadmap = roadmaps.filter((r) => r.career_name === selectedCareer.name);

    return (
      <div className="space-y-6 animate-fadeIn">
        <button onClick={() => setSelectedCareer(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Career Explorer
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2">
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${CATEGORY_COLORS[selectedCareer.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {selectedCareer.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedCareer.name}</h1>
            <p className="text-gray-600 mt-3 max-w-2xl">{selectedCareer.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedCareer.growth_outlook && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Growth Outlook</h3>
              </div>
              <p className="text-sm text-gray-600">{selectedCareer.growth_outlook}</p>
            </Card>
          )}
          {selectedCareer.avg_salary && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Average Salary</h3>
              </div>
              <p className="text-sm text-gray-600">{selectedCareer.avg_salary}</p>
            </Card>
          )}
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {selectedCareer.required_skills.map((s) => <Badge key={s} color="blue">{s}</Badge>)}
          </div>
        </Card>

        {selectedCareer.recommended_education && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Recommended Education
            </h2>
            <p className="text-sm text-gray-600">{selectedCareer.recommended_education}</p>
          </Card>
        )}

        {/* Beginner roadmap */}
        {careerRoadmap.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-blue-600" />
              Beginner Roadmap
            </h2>
            <div className="space-y-3">
              {careerRoadmap.map((phase) => (
                <div key={phase.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                    {phase.phase_number}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{phase.phase_title}</h3>
                    {phase.objectives && phase.objectives.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{phase.objectives[0]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Typical projects */}
        {(selectedCareer.typical_projects?.length > 0 || careerProjects.length > 0) && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Typical Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {careerProjects.length > 0 ? careerProjects.map((p) => (
                <div key={p.id} className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 text-sm">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge color={p.difficulty === 'beginner' ? 'green' : p.difficulty === 'intermediate' ? 'yellow' : 'red'}>{p.difficulty}</Badge>
                  </div>
                </div>
              )) : selectedCareer.typical_projects.map((p, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-medium text-gray-900 text-sm">{p}</h3>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Certifications */}
        {careerCerts.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-blue-600" />
              Recommended Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {careerCerts.map((c) => (
                <a key={c.id} href={c.url || '#'} target="_blank" rel="noopener noreferrer" className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <h3 className="font-medium text-gray-900 text-sm">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{c.provider}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.description}</p>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Related careers */}
        {selectedCareer.related_careers?.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Related Careers</h2>
            <div className="flex flex-wrap gap-2">
              {selectedCareer.related_careers.map((c) => {
                const related = careers.find((ca) => ca.name === c);
                return related ? (
                  <button key={c} onClick={() => setSelectedCareer(related)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition">
                    {c}
                  </button>
                ) : <Badge key={c} color="gray">{c}</Badge>;
              })}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Grid view
  const categories = Array.from(new Set(careers.map((c) => c.category)));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Explorer</h1>
        <p className="text-gray-500 mt-1">Discover career paths across different domains</p>
      </div>

      {categories.map((category) => {
        const categoryCareers = careers.filter((c) => c.category === category);
        return (
          <div key={category}>
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryCareers.map((career) => (
                <button
                  key={career.id}
                  onClick={() => setSelectedCareer(career)}
                  className="text-left p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition">{career.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[career.category]?.split(' ')[0] || 'bg-gray-100'}`} />
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{career.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {career.required_skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{s}</span>
                    ))}
                    {career.required_skills.length > 4 && <span className="text-xs text-gray-400">+{career.required_skills.length - 4} more</span>}
                  </div>
                  {career.growth_outlook && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                      <TrendingUp className="w-3.5 h-3.5" /> {career.growth_outlook}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
