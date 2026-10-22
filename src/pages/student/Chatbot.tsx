import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateChatbotResponse } from '@/lib/aiService';
import { Card } from '@/components/ui';
import type { Profile, Career, CategoryScore, AssessmentAnswer } from '@/types';
import { MessageSquare, Send, Brain, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What career should I choose?',
  'What skills do I need for Data Science?',
  'How can I prepare for an AI/ML job?',
  'I know Python and SQL. What career fits me?',
  'Tell me about cybersecurity careers',
];

export function Chatbot() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profRes, careerRes, ansRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('careers').select('*'),
        supabase.from('assessment_answers').select('*').eq('user_id', user.id),
      ]);
      setProfile(profRes.data as Profile | null);
      setCareers(careerRes.data as Career[] || []);
      const answers = ansRes.data as AssessmentAnswer[] || [];
      const catMap = new Map<string, number>();
      answers.forEach((a) => catMap.set(a.category, (catMap.get(a.category) || 0) + a.answer_value));
      setCategoryScores(Array.from(catMap.entries()).map(([cat, score]) => ({ category: cat, score, maxScore: 15 })));
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!loading && messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: `Hello ${profile?.full_name || 'there'}! I'm CareerAI, your personalized career guidance assistant. I can help you with career recommendations, skill requirements, learning roadmaps, and more. Ask me anything about your career journey!`,
      }]);
    }
  }, [loading, profile, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || responding) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setResponding(true);

    const response = await generateChatbotResponse(text, profile, categoryScores, careers);
    setMessages((prev) => [...prev, { role: 'bot', content: response }]);
    setResponding(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading CareerAI...</div>;

  return (
    <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CareerAI Chatbot</h1>
          <p className="text-sm text-gray-500">Your AI-powered career guidance assistant</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'bot' ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gray-200'
              }`}>
                {msg.role === 'bot' ? <Brain className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-600" />}
              </div>
              <div className={`max-w-[75%] p-4 rounded-2xl ${
                msg.role === 'bot' ? 'bg-gray-50 text-gray-700' : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}

          {responding && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {messages.length <= 1 && (
            <div className="pt-4">
              <p className="text-xs text-gray-400 mb-2 font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
                placeholder="Ask CareerAI anything about careers..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                disabled={responding}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || responding}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
