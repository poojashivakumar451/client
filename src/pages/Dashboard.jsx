import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Activity, Send, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import API_BASE_URL from '../api';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResult = async () => {
      if (!currentUser?.email) return setLoading(false);
      try {
        const q = query(collection(db, "students_results"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setResult(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.log("No result yet or error", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchResult();
    else setLoading(false);
  }, [currentUser]);

  const sections = [
    { name: 'Verbal Ability', qcount: 15, time: 15, section: 'A: Foundation' },
    { name: 'Reasoning Ability', qcount: 10, time: 10, section: 'A: Foundation' },
    { name: 'Numerical Ability', qcount: 10, time: 10, section: 'A: Foundation' },
    { name: 'Advanced Quant & Reasoning', qcount: 10, time: 20, section: 'B: Advance' },
    { name: 'Advanced Coding', qcount: 1, time: 10, section: 'B: Advance' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('masterUser');
    localStorage.removeItem('token');
    auth.signOut();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-primary text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight shrink-0">TechMasters <span className="text-accent underline decoration-2 underline-offset-4">Portal</span></h1>
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <span className="text-xs sm:text-sm font-medium opacity-80 truncate max-w-[150px] sm:max-w-none">Welcome, {currentUser?.name}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Student Dashboard</h2>
          <p className="text-sm sm:text-base text-slate-500">View your assigned assessments and performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Assessment / Results Overview */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-100 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800">Assessment Summary</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Official scorecard and performance metrics</p>
                  </div>
                  <div className={`px-6 py-2 rounded-full font-black text-xs tracking-widest self-start sm:self-auto ${result.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {result.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1">Percentage</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{result.percentage}%</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1">Total Score</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{result.totalScore}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase mb-1">Section Count</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800">5</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase mb-1">Final Rank</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700">#{result.rank || '1'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(result.sectionScores || {}).map(([key, score], idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-700 capitalize">{key.replace('-', ' ')}</span>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${(score/15)*100}%` }}></div>
                        </div>
                        <span className="font-black text-slate-400 text-xs shrink-0">{score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button onClick={() => navigate('/result')} className="w-full sm:flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">View Full Details</button>
                  <button onClick={() => window.print()} className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs">Print</button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-secondary" /> Assessment Details
                  </h3>
                  <span className="bg-secondary/10 text-secondary text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Company</p>
                      <p className="font-semibold text-xs sm:text-sm text-slate-700 uppercase truncate">TechMasters Innovations Private Limited</p>
                    </div>
                    <Activity className="text-slate-300 shrink-0" />
                  </div>

                  <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border-2 border-slate-100 p-1 sm:p-2">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Component</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Questions</th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Section A Header */}
                        <tr className="bg-indigo-50/50">
                          <td colSpan="3" className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                            Section A: Foundation (35 Minutes)
                          </td>
                        </tr>
                        {sections.filter(s => s.section.startsWith('A:')).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-700 text-sm sm:text-base font-bold">{s.name}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-xs sm:text-sm text-center">{s.qcount}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-xs sm:text-sm text-center">{s.time} Min</td>
                          </tr>
                        ))}
                        
                        {/* Section B Header */}
                        <tr className="bg-indigo-50/50">
                          <td colSpan="3" className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] font-black text-indigo-600 uppercase tracking-widest border-t border-slate-100">
                            Section B: Advance (30 Minutes)
                          </td>
                        </tr>
                        {sections.filter(s => s.section.startsWith('B:')).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-700 text-sm sm:text-base font-bold">{s.name}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-xs sm:text-sm text-center">{s.qcount}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500 font-mono text-xs sm:text-sm text-center">{s.time} Min</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => navigate('/assessment')}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center px-8 py-3"
                  >
                    START ASSESSMENT <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats/Profile Side */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary to-blue-700 text-white p-5 sm:p-6 rounded-xl shadow-lg border-none">
              <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="opacity-80">Total Duration</span>
                  <span className="font-bold">65+ Minutes</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="opacity-80">Difficulty Level</span>
                  <span className="font-bold uppercase">Moderate-Advanced</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full mt-4">
                  <div className="h-full bg-accent rounded-full w-0 transition-all duration-1000" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Important Rules</h3>
              <ul className="text-xs sm:text-sm text-slate-500 space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                  Full-screen mode is mandatory.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                  Tab switching will result in auto-submission.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                  Timer cannot be paused.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
