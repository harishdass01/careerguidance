import type { Profile, CategoryScore, Career, CareerRecommendation } from '@/types';

/**
 * AI Service Layer
 *
 * This module provides a clean interface for AI-powered features.
 * If VITE_AI_API_KEY is configured, it calls an external AI API.
 * Otherwise, it falls back to a rule-based mock implementation.
 *
 * To connect a real AI API:
 * 1. Set VITE_AI_API_KEY in your .env file
 * 2. Replace the mock functions with API calls (see callExternalAI)
 * The function signatures stay the same — the frontend won't change.
 */

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;

interface RecommendationInput {
  profile: Profile | null;
  categoryScores: CategoryScore[];
  careers: Career[];
  studentSkills: { skill_name: string; proficiency: number }[];
}

interface RecommendationResult {
  career_name: string;
  match_percentage: number;
  reason: string;
  matching_skills: string[];
  missing_skills: string[];
  recommended_resources: { title: string; url: string }[];
  suggested_projects: { title: string; description: string }[];
  growth_info: string;
}

const RESOURCE_MAP: Record<string, { title: string; url: string }[]> = {
  'Software Developer': [
    { title: 'The Odin Project', url: 'https://www.theodinproject.com' },
    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  ],
  'Data Analyst': [
    { title: 'Google Data Analytics', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
    { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' },
    { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial' },
  ],
  'Data Scientist': [
    { title: 'Andrew Ng ML Course', url: 'https://www.coursera.org/specializations/machine-learning' },
    { title: 'Kaggle Competitions', url: 'https://www.kaggle.com' },
    { title: 'Towards Data Science', url: 'https://towardsdatascience.com' },
  ],
  'AI Engineer': [
    { title: 'Deep Learning Specialization', url: 'https://www.coursera.org/specializations/deep-learning' },
    { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials' },
    { title: 'Papers With Code', url: 'https://paperswithcode.com' },
  ],
  'Cybersecurity Analyst': [
    { title: 'TryHackMe', url: 'https://tryhackme.com' },
    { title: 'HackTheBox', url: 'https://www.hackthebox.com' },
    { title: 'OWASP', url: 'https://owasp.org' },
  ],
  'Cloud Engineer': [
    { title: 'AWS Training', url: 'https://aws.amazon.com/training' },
    { title: 'Google Cloud Training', url: 'https://cloud.google.com/training' },
    { title: 'Microsoft Learn', url: 'https://learn.microsoft.com' },
  ],
  'UI/UX Designer': [
    { title: 'Google UX Design', url: 'https://www.coursera.org/professional-certificates/google-ux' },
    { title: 'Figma Academy', url: 'https://www.figma.com/academy' },
    { title: 'NNGroup', url: 'https://www.nngroup.com' },
  ],
  'Digital Marketing Specialist': [
    { title: 'Google Digital Marketing', url: 'https://learndigital.withgoogle.com' },
    { title: 'HubSpot Academy', url: 'https://academy.hubspot.com' },
    { title: 'Moz SEO Guide', url: 'https://moz.com/beginners-guide-to-seo' },
  ],
  'Business Analyst': [
    { title: 'IIBA Learning', url: 'https://www.iiba.org' },
    { title: 'Coursera Business Analysis', url: 'https://www.coursera.org' },
    { title: 'LinkedIn Learning BA', url: 'https://www.linkedin.com/learning' },
  ],
  'Agriculture Technology Specialist': [
    { title: 'PrecisionAg', url: 'https://www.precisionag.org' },
    { title: 'AgriTech Courses', url: 'https://www.coursera.org' },
    { title: 'IoT in Agriculture', url: 'https://www.edx.org' },
  ],
};

const PROJECT_MAP: Record<string, { title: string; description: string }[]> = {
  'Software Developer': [
    { title: 'E-Commerce Web App', description: 'Build a full-stack e-commerce application with cart and checkout.' },
    { title: 'Task Management System', description: 'Create a Kanban board app with drag-and-drop functionality.' },
  ],
  'Data Analyst': [
    { title: 'Sales Dashboard', description: 'Create an interactive sales performance dashboard in Power BI.' },
    { title: 'Customer Segmentation', description: 'Segment customers using Python and clustering algorithms.' },
  ],
  'Data Scientist': [
    { title: 'Churn Prediction Model', description: 'Build an ML model to predict customer churn.' },
    { title: 'Recommendation Engine', description: 'Create a collaborative filtering recommendation system.' },
  ],
  'AI Engineer': [
    { title: 'AI Chatbot', description: 'Build an intelligent chatbot using NLP and intent recognition.' },
    { title: 'Image Classification', description: 'Train a CNN model to classify images.' },
  ],
  'Cybersecurity Analyst': [
    { title: 'Security Audit Tool', description: 'Develop a tool that scans networks for vulnerabilities.' },
    { title: 'Log Analysis Dashboard', description: 'Build a SIEM-like dashboard for security log analysis.' },
  ],
  'Cloud Engineer': [
    { title: 'Auto-Scaling Infrastructure', description: 'Deploy a web app with auto-scaling on AWS.' },
    { title: 'CI/CD Pipeline', description: 'Create a complete CI/CD pipeline with GitHub Actions.' },
  ],
  'UI/UX Designer': [
    { title: 'Mobile App Redesign', description: 'Redesign a banking app focusing on usability and accessibility.' },
    { title: 'Design System', description: 'Create a complete design system with components.' },
  ],
  'Digital Marketing Specialist': [
    { title: 'SEO Campaign', description: 'Optimize a website to rank on the first page of Google.' },
    { title: 'Social Media Strategy', description: 'Plan and execute a month-long social media campaign.' },
  ],
  'Business Analyst': [
    { title: 'Process Optimization', description: 'Analyze and optimize a business process for efficiency.' },
    { title: 'Market Research Report', description: 'Conduct market research and present data-driven findings.' },
  ],
  'Agriculture Technology Specialist': [
    { title: 'Smart Irrigation System', description: 'Build an IoT-based smart irrigation prototype.' },
    { title: 'Crop Yield Prediction', description: 'Use ML to predict crop yields from environmental data.' },
  ],
};

export async function generateRecommendations(input: RecommendationInput): Promise<RecommendationResult[]> {
  if (AI_API_KEY) {
    try {
      return (await callExternalAI('recommendations', input)) as RecommendationResult[];
    } catch {
      // fall through to mock
    }
  }
  return mockRecommendations(input);
}

export async function generateChatbotResponse(
  message: string,
  profile: Profile | null,
  categoryScores: CategoryScore[],
  careers: Career[],
): Promise<string> {
  if (AI_API_KEY) {
    try {
      const result = await callExternalAI('chat', { message, profile, categoryScores, careers });
      return (result as unknown as string) || mockChatResponse(message, profile, categoryScores, careers);
    } catch {
      // fall through to mock
    }
  }
  return mockChatResponse(message, profile, categoryScores, careers);
}

export async function analyzeResume(
  resumeText: string,
  profile: Profile | null,
  careers: Career[],
): Promise<{
  detected_skills: string[];
  relevant_careers: { career: string; match: number }[];
  missing_skills: string[];
  completeness: number;
  suggestions: string[];
  project_recommendations: string[];
}> {
  if (AI_API_KEY) {
    try {
      return (await callExternalAI('resume', { resumeText, profile, careers })) as {
        detected_skills: string[];
        relevant_careers: { career: string; match: number }[];
        missing_skills: string[];
        completeness: number;
        suggestions: string[];
        project_recommendations: string[];
      };
    } catch {
      // fall through to mock
    }
  }
  return mockResumeAnalysis(resumeText, profile, careers);
}

async function callExternalAI(endpoint: string, payload: unknown): Promise<RecommendationResult[] | string | Record<string, unknown>> {
  const response = await fetch(`${import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1'}/career-${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  return response.json();
}

// ============================================================
// MOCK IMPLEMENTATIONS (used when no AI API key is configured)
// ============================================================

function mockRecommendations(input: RecommendationInput): RecommendationResult[] {
  const { profile, categoryScores, careers, studentSkills } = input;
  const results: RecommendationResult[] = [];

  const studentSkillNames = studentSkills.map((s) => s.skill_name.toLowerCase());
  const studentSkillMap = new Map(
    studentSkills.map((s) => [s.skill_name.toLowerCase(), s.proficiency]),
  );
  const profileTechSkills = (profile?.technical_skills || []).map((s) => s.toLowerCase());
  const profileSoftSkills = (profile?.soft_skills || []).map((s) => s.toLowerCase());

  const allStudentSkills = new Set([...studentSkillNames, ...profileTechSkills, ...profileSoftSkills]);

  const categoryScoreMap = new Map(
    categoryScores.map((cs) => [cs.category.toLowerCase(), cs.score / cs.maxScore]),
  );

  for (const career of careers) {
    const requiredSkills = career.required_skills.map((s) => s);
    const matching: string[] = [];
    const missing: string[] = [];

    for (const skill of requiredSkills) {
      const skillLower = skill.toLowerCase();
      if (allStudentSkills.has(skillLower)) {
        const prof = studentSkillMap.get(skillLower);
        if (prof && prof >= 60) {
          matching.push(skill);
        } else {
          missing.push(skill);
        }
      } else {
        missing.push(skill);
      }
    }

    let matchPct = 0;
    if (requiredSkills.length > 0) {
      matchPct = Math.round((matching.length / requiredSkills.length) * 100);
    }

    const categoryMatch = career.category.toLowerCase();
    const relevantCategoryScore = categoryScoreMap.get(categoryMatch) || 0;
    const interestMatch = (profile?.interests || []).some(
      (i) => i.toLowerCase().includes(categoryMatch) || categoryMatch.includes(i.toLowerCase()),
    );

    if (interestMatch) matchPct = Math.min(100, matchPct + 10);
    matchPct = Math.round(matchPct * 0.7 + relevantCategoryScore * 30);
    matchPct = Math.min(100, Math.max(0, matchPct));

    if (matchPct < 15) continue;

    const reasons: string[] = [];
    if (matching.length > 0) reasons.push(`You already have ${matching.length} of the ${requiredSkills.length} key skills for this career.`);
    if (interestMatch) reasons.push(`Your interests align well with ${career.category}.`);
    if (relevantCategoryScore > 0.6) reasons.push(`Your assessment scores show strong aptitude in related areas.`);
    if (profile?.preferred_career_domain && profile.preferred_career_domain.toLowerCase().includes(categoryMatch)) {
      reasons.push(`This matches your preferred career domain.`);
    }
    if (reasons.length === 0) reasons.push(`This career could be a good path based on your overall profile.`);

    results.push({
      career_name: career.name,
      match_percentage: matchPct,
      reason: reasons.join(' '),
      matching_skills: matching,
      missing_skills: missing,
      recommended_resources: RESOURCE_MAP[career.name] || [],
      suggested_projects: PROJECT_MAP[career.name] || [],
      growth_info: career.growth_outlook || 'Growing career field with good opportunities.',
    });
  }

  results.sort((a, b) => b.match_percentage - a.match_percentage);
  return results.slice(0, 5);
}

function mockChatResponse(
  message: string,
  profile: Profile | null,
  categoryScores: CategoryScore[],
  careers: Career[],
): string {
  const lower = message.toLowerCase();
  const studentName = profile?.full_name || 'there';
  const studentSkills = [
    ...(profile?.technical_skills || []),
    ...(profile?.soft_skills || []),
  ];

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello ${studentName}! I'm CareerAI, your personalized career guidance assistant. I can help you with career recommendations, skill gap analysis, learning roadmaps, and more. What would you like to know?`;
  }

  if (lower.includes('data science') || lower.includes('data scientist')) {
    const career = careers.find((c) => c.name === 'Data Scientist');
    if (career) {
      const have = career.required_skills.filter((s) => studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase()));
      const need = career.required_skills.filter((s) => !studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase()));
      return `Data Science is an excellent field, ${studentName}! It involves building predictive models and extracting insights from data.\n\nKey skills needed: ${career.required_skills.join(', ')}.\n\n${have.length > 0 ? `You already have: ${have.join(', ')}. Great start!` : 'You\'re starting fresh.'}\n${need.length > 0 ? `Skills to develop: ${need.join(', ')}.` : ''}\n\nThe growth outlook is very strong with 36% projected growth. I'd recommend starting with Python and Statistics, then moving to Machine Learning.\n\nWould you like me to show you a learning roadmap for Data Science?`;
    }
  }

  if (lower.includes('data analyst')) {
    const career = careers.find((c) => c.name === 'Data Analyst');
    if (career) {
      const have = career.required_skills.filter((s) => studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase()));
      const need = career.required_skills.filter((s) => !studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase()));
      return `Data Analytics is a great choice, ${studentName}! Data analysts help organizations make better decisions through data visualization and reporting.\n\nKey skills: ${career.required_skills.join(', ')}.\n\n${have.length > 0 ? `You already know: ${have.join(', ')}.` : ''}\n${need.length > 0 ? `You should learn: ${need.join(', ')}.` : ''}\n\nStart with SQL and Python, then move to visualization tools like Power BI or Tableau. Would you like to see a detailed roadmap?`;
    }
  }

  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) {
    const career = careers.find((c) => c.name === 'AI Engineer' || c.name === 'Data Scientist');
    if (career) {
      const have = career.required_skills.filter((s) => studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase()));
      return `AI/ML is one of the fastest-growing fields, ${studentName}! As an AI Engineer, you'd build intelligent systems using NLP, computer vision, and deep learning.\n\nKey skills: ${career.required_skills.join(', ')}.\n\n${have.length > 0 ? `You already have: ${have.join(', ')}.` : 'Start with Python and Mathematics fundamentals.'}\n\nI recommend: 1) Master Python, 2) Learn Statistics & Linear Algebra, 3) Study Machine Learning algorithms, 4) Practice with TensorFlow, 5) Build real projects. Check the Career Explorer for a detailed roadmap!`;
    }
  }

  if (lower.includes('cybersecurity') || lower.includes('security')) {
    return `Cybersecurity is a critical and growing field, ${studentName}! You'd protect systems from threats and vulnerabilities.\n\nKey skills: Network security, Python, Cryptography, Linux, Threat analysis.\n\nStart with networking fundamentals, then learn security concepts. Platforms like TryHackMe and HackTheBox are great for hands-on practice. Consider getting CompTIA Security+ certified.\n\nWould you like to see the cybersecurity learning roadmap?`;
  }

  if (lower.includes('python')) {
    const pythonCareers = careers.filter((c) => c.required_skills.includes('Python'));
    return `Python is a versatile skill, ${studentName}! It opens doors to several careers:\n\n${pythonCareers.map((c) => `- ${c.name}`).join('\n')}\n\n${studentSkills.includes('Python') ? 'Since you already know Python, consider building on it with SQL, Statistics, or a framework like TensorFlow depending on your interest.' : 'Python is a great starting point. I recommend learning it well, then specializing based on your interests.'}\n\nWhat area interests you most?`;
  }

  if (lower.includes('sql')) {
    const sqlCareers = careers.filter((c) => c.required_skills.includes('SQL'));
    return `SQL is fundamental for data-related careers, ${studentName}! Careers that use SQL:\n\n${sqlCareers.map((c) => `- ${c.name}`).join('\n')}\n\n${studentSkills.includes('SQL') ? 'Great that you know SQL! Consider pairing it with Python and a BI tool like Power BI.' : 'I recommend learning SQL through hands-on practice. Try SQLBolt or Mode SQL Tutorial.'}\n\nWould you like career recommendations based on your full profile?`;
  }

  if (lower.includes('career') || lower.includes('recommend') || lower.includes('which') || lower.includes('what should')) {
    if (studentSkills.length > 0) {
      const topMatch = careers.map((c) => {
        const have = c.required_skills.filter((s) => studentSkills.map((ss) => ss.toLowerCase()).includes(s.toLowerCase())).length;
        return { name: c.name, match: Math.round((have / c.required_skills.length) * 100) };
      }).sort((a, b) => b.match - a.match).slice(0, 3);
      return `Based on your current skills (${studentSkills.join(', ')}), here are my top recommendations, ${studentName}:\n\n${topMatch.map((t, i) => `${i + 1}. ${t.name} (${t.match}% match)`).join('\n')}\n\nVisit the Career Recommendations page for a detailed analysis with skill gaps and learning roadmaps!`;
    }
    return `I'd love to help with career recommendations, ${studentName}! To give you personalized advice, please complete your profile and take the assessment first. Then visit the Career Recommendations page for a detailed analysis. You can also explore the Career Explorer to learn about different career paths.`;
  }

  if (lower.includes('roadmap') || lower.includes('plan') || lower.includes('prepare')) {
    return `I can help you with a learning roadmap, ${studentName}! Visit the Learning Roadmap page after getting your career recommendations. Each career has a step-by-step roadmap with learning objectives, resources, and projects for each phase. You can track your progress as you complete each phase. Which career are you interested in?`;
  }

  if (lower.includes('skill') && (lower.includes('gap') || lower.includes('missing') || lower.includes('need'))) {
    return `Skill gap analysis shows you the difference between your current skills and what's needed for a career, ${studentName}. Visit the Skill Gap Analysis page after getting recommendations to see a visual comparison. You'll see which skills you've mastered, which need improvement, and which are missing — along with priority levels.`;
  }

  if (lower.includes('resume')) {
    return `You can upload your resume on the Resume Analyzer page, ${studentName}! I'll analyze it to detect your skills, suggest relevant career paths, identify missing skills, and give you improvement suggestions. The resume file itself isn't stored — only the analysis results are saved for your reference.`;
  }

  // default response
  return `I'm here to help with your career journey, ${studentName}! You can ask me about:\n\n- Career recommendations based on your skills\n- What skills you need for a specific career\n- How to prepare for a particular job\n- Learning roadmaps and resources\n- Skill gap analysis\n\n${studentSkills.length > 0 ? `Your current skills: ${studentSkills.join(', ')}` : 'Complete your profile to get personalized advice!'}\n\nWhat would you like to know?`;
}

function mockResumeAnalysis(
  resumeText: string,
  profile: Profile | null,
  careers: Career[],
): {
  detected_skills: string[];
  relevant_careers: { career: string; match: number }[];
  missing_skills: string[];
  completeness: number;
  suggestions: string[];
  project_recommendations: string[];
} {
  const allKnownSkills = new Set<string>();
  careers.forEach((c) => c.required_skills.forEach((s) => allKnownSkills.add(s)));
  const lowerText = resumeText.toLowerCase();

  const detected: string[] = [];
  for (const skill of allKnownSkills) {
    if (lowerText.includes(skill.toLowerCase())) {
      detected.push(skill);
    }
  }
  // Also check profile skills
  if (profile) {
    [...(profile.technical_skills || []), ...(profile.soft_skills || [])].forEach((s) => {
      if (!detected.includes(s)) detected.push(s);
    });
  }

  const careerMatches = careers
    .map((c) => {
      const have = c.required_skills.filter((s) => detected.map((d) => d.toLowerCase()).includes(s.toLowerCase()));
      return { career: c.name, match: Math.round((have.length / c.required_skills.length) * 100) };
    })
    .filter((c) => c.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  const topCareer = careerMatches[0]?.career;
  const missingForTop = topCareer
    ? careers.find((c) => c.name === topCareer)?.required_skills.filter((s) => !detected.map((d) => d.toLowerCase()).includes(s.toLowerCase())) || []
    : [];

  let completeness = 50;
  if (resumeText.length > 200) completeness += 10;
  if (resumeText.length > 500) completeness += 10;
  if (detected.length > 3) completeness += 10;
  if (detected.length > 6) completeness += 10;
  if (/experience|worked|intern/.test(lowerText)) completeness += 5;
  if (/project|built|developed/.test(lowerText)) completeness += 5;
  completeness = Math.min(100, completeness);

  const suggestions: string[] = [];
  if (completeness < 80) suggestions.push('Add more detail to your resume — include specific projects and their impact.');
  if (detected.length < 5) suggestions.push('List more technical skills relevant to your target career.');
  if (!/experience|worked|intern/i.test(resumeText)) suggestions.push('Add any internships, part-time jobs, or relevant work experience.');
  if (!/project|built|developed/i.test(resumeText)) suggestions.push('Include academic or personal projects with descriptions.');
  if (!/certification|certified/i.test(resumeText)) suggestions.push('Add any certifications you have completed.');
  suggestions.push('Quantify your achievements with metrics where possible.');
  suggestions.push('Tailor your resume to the specific job role you are applying for.');

  const projectRecs: string[] = [];
  for (const match of careerMatches.slice(0, 3)) {
    const career = careers.find((c) => c.name === match.career);
    if (career) {
      projectRecs.push(`${match.career}: ${career.typical_projects[0] || 'Build a relevant project'}`);
    }
  }

  return {
    detected_skills: detected,
    relevant_careers: careerMatches,
    missing_skills: missingForTop,
    completeness,
    suggestions,
    project_recommendations: projectRecs,
  };
}
