import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { analyzeResume } from '@/lib/aiService';
import { Card, Badge, EmptyState, ProgressBar } from '@/components/ui';
import type { Profile, Career, ResumeAnalysis } from '@/types';
import {
  FileText, Upload, CheckCircle2, AlertCircle, Lightbulb, Briefcase,
  TrendingUp, FileCheck, Sparkles,
} from 'lucide-react';

export function ResumeAnalyzer() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profRes, careerRes, analysisRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('careers').select('*'),
        supabase.from('resume_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setProfile(profRes.data as Profile | null);
      setCareers(careerRes.data as Career[] || []);
      setAnalyses(analysisRes.data as ResumeAnalysis[] || []);
      setLoading(false);
    })();
  }, [user]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  }

  async function handleAnalyze() {
    if (!user || (!resumeText && !profile)) return;
    setAnalyzing(true);

    const textToAnalyze = resumeText || buildProfileText(profile);
    const result = await analyzeResume(textToAnalyze, profile, careers);

    await supabase.from('resume_analyses').insert({
      user_id: user.id,
      file_name: fileName || 'Profile-based analysis',
      detected_skills: result.detected_skills,
      relevant_careers: result.relevant_careers,
      missing_skills: result.missing_skills,
      completeness: result.completeness,
      suggestions: result.suggestions,
      project_recommendations: result.project_recommendations,
    });

    const { data } = await supabase.from('resume_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnalyses(data as ResumeAnalysis[] || []);
    setAnalyzing(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1">Upload your resume for AI-powered analysis and career insights</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Resume
        </h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
        >
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          {fileName ? (
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1">Click to change file</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700">Click to upload your resume (PDF/TXT)</p>
              <p className="text-sm text-gray-400 mt-1">The file is analyzed but not permanently stored</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || (!resumeText && !profile)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50"
          >
            {analyzing ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          {!resumeText && profile && (
            <span className="text-xs text-gray-400">Or analyze based on your profile data</span>
          )}
        </div>
      </Card>

      {analyzing && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Analyzing your resume...</p>
          </div>
        </Card>
      )}

      {!analyzing && !latestAnalysis && (
        <Card className="p-8">
          <EmptyState icon={FileCheck} title="No analysis yet" description="Upload your resume or analyze your profile to see detected skills, career matches, and improvement suggestions." />
        </Card>
      )}

      {!analyzing && latestAnalysis && (
        <div className="space-y-6">
          {/* Completeness */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Resume Completeness
              </h2>
              <div className="text-2xl font-bold text-blue-600">{latestAnalysis.completeness}%</div>
            </div>
            <ProgressBar value={latestAnalysis.completeness} color={latestAnalysis.completeness >= 75 ? 'green' : latestAnalysis.completeness >= 50 ? 'yellow' : 'red'} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detected skills */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Detected Skills ({latestAnalysis.detected_skills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {latestAnalysis.detected_skills.length > 0 ? latestAnalysis.detected_skills.map((s) => (
                  <Badge key={s} color="green">{s}</Badge>
                )) : <span className="text-sm text-gray-400">No skills detected</span>}
              </div>
            </Card>

            {/* Missing skills */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Missing Important Skills ({latestAnalysis.missing_skills.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {latestAnalysis.missing_skills.length > 0 ? latestAnalysis.missing_skills.map((s) => (
                  <Badge key={s} color="orange">{s}</Badge>
                )) : <span className="text-sm text-gray-400">No critical skills missing</span>}
              </div>
            </Card>
          </div>

          {/* Relevant careers */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Relevant Career Paths
            </h2>
            <div className="space-y-3">
              {latestAnalysis.relevant_careers && latestAnalysis.relevant_careers.length > 0 ? (
                (latestAnalysis.relevant_careers as { career: string; match: number }[]).map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 w-48 truncate">{c.career}</span>
                    <div className="flex-1"><ProgressBar value={c.match} color={c.match >= 70 ? 'green' : c.match >= 50 ? 'yellow' : 'red'} /></div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">{c.match}%</span>
                  </div>
                ))
              ) : <span className="text-sm text-gray-400">No career matches found</span>}
            </div>
          </Card>

          {/* Suggestions */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Suggested Improvements
            </h2>
            <ul className="space-y-2">
              {latestAnalysis.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          {/* Project recommendations */}
          {latestAnalysis.project_recommendations && latestAnalysis.project_recommendations.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Project Recommendations
              </h2>
              <div className="space-y-2">
                {latestAnalysis.project_recommendations.map((p, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">{p}</div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function buildProfileText(profile: Profile | null): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.full_name) parts.push(profile.full_name);
  if (profile.department) parts.push(`Department: ${profile.department}`);
  if (profile.previous_experience) parts.push(`Experience: ${profile.previous_experience}`);
  if (profile.technical_skills?.length) parts.push(`Technical Skills: ${profile.technical_skills.join(', ')}`);
  if (profile.soft_skills?.length) parts.push(`Soft Skills: ${profile.soft_skills.join(', ')}`);
  if (profile.certifications?.length) parts.push(`Certifications: ${profile.certifications.join(', ')}`);
  if (profile.projects?.length) parts.push(`Projects: ${profile.projects.map(p => p.title).join(', ')}`);
  if (profile.career_goal) parts.push(`Career Goal: ${profile.career_goal}`);
  return parts.join('\n');
}
