import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../api';
import { 
  Trophy, Mail, User, BarChart3, 
  Award, Hash, CheckCircle2, XCircle 
} from 'lucide-react';

const Result = () => {
  const { currentUser, token } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/results/my-result`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(res.data);
      } catch (err) {
        console.error("Result fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchResult();
  }, [currentUser, token]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Generating Scorecard...</div>;

  if (!result) return <div className="h-screen flex items-center justify-center text-slate-500">No result found.</div>;

  const sections = [
    { name: 'Verbal Ability', score: result.sectionScores?.verbal || 0, max: 15 },
    { name: 'Reasoning Ability', score: result.sectionScores?.logical || 0, max: 10 },
    { name: 'Numerical Ability', score: result.sectionScores?.numerical || 0, max: 10 },
    { name: 'Advanced Quant/Reasoning', score: result.sectionScores?.['advance-quant'] || 0, max: 10 },
    { name: 'Coding Assessment', score: result.sectionScores?.coding || 0, max: 2 },
  ];

  const isPassed = result.status === 'PASS';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-primary text-white rounded-[2rem] p-10 shadow-2xl mb-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="flex items-center gap-6 z-10">
            <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <User className="w-12 h-12 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{currentUser?.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Mail className="w-4 h-4" /> {currentUser?.email}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end z-10">
            <div className={`px-8 py-3 rounded-2xl font-black text-xl tracking-widest flex items-center gap-2 mb-2 ${isPassed ? 'bg-green-500 shadow-lg shadow-green-900/40' : 'bg-red-500 shadow-lg shadow-red-900/40'}`}>
              {isPassed ? <CheckCircle2 /> : <XCircle />} {result.status}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.3em]">Official Status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Scores */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <BarChart3 className="text-secondary" /> Section-wise Performance
              </h2>
              <div className="space-y-6">
                {sections.map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-slate-700">{s.name}</span>
                      <span className="text-sm font-black text-slate-400">{s.score} / {s.max}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isPassed ? 'bg-secondary' : 'bg-slate-400'}`}
                        style={{ width: `${(s.score / (typeof s.max === 'number' ? s.max : 10)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce-slow" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Percentage Score</p>
              <h3 className="text-6xl font-black text-slate-800 mb-4">{result.percentage}%</h3>
              <div className="w-full h-px bg-slate-100 my-6"></div>
              <div className="flex justify-between w-full text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                <div className="flex flex-col items-center">
                  <Award className="mb-1 text-secondary" />
                  <span>Rank: {result.rank}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Hash className="mb-1 text-secondary" />
                  <span>Score: {result.totalScore}</span>
                </div>
              </div>
            </div>

            <button 
              className="w-full py-5 rounded-2xl bg-slate-800 text-white font-black uppercase tracking-[.2em] shadow-xl hover:bg-black transition-all"
              onClick={() => window.print()}
            >
              Download Scorecard
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.4em]">TechMasters Innovations Private Limited © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Result;
