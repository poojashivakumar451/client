import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Activity, Send, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import API_BASE_URL from '../api';

const Dashboard = () => {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/results/my-result`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResult(res.data);
      } catch (err) {
        console.log("No result yet or error");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchResult();
    else setLoading(false);
  }, [token]);

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">TechMasters <span className="text-accent underline decoration-2 underline-offset-4">Portal</span></h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium opacity-80">Welcome, {currentUser?.name}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Student Dashboard</h2>
          <p className="text-slate-500">View your assigned assessments and performance.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Assessment / Results Overview */}
          <div className="md:col-span-2 space-y-6">
            {result ? (
              <div className="bg-white p-8 rounded-2xl border-2 border-emerald-100 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Assessment Summary</h3>
                    <p className="text-slate-400 text-sm">Official scorecard and performance metrics</p>
                  </div>
                  <div className={`px-6 py-2 rounded-full font-black text-xs tracking-widest ${result.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {result.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Percentage</p>
                    <p className="text-2xl font-black text-slate-800">{result.percentage}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Score</p>
                    <p className="text-2xl font-black text-slate-800">{result.totalScore}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Section Count</p>
                    <p className="text-2xl font-black text-slate-800">5</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Final Rank</p>
                    <p className="text-2xl font-black text-emerald-700">#{result.rank || '1'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(result.sectionScores || {}).map(([key, score], idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                      <span className="font-bold text-slate-700 capitalize">{key.replace('-', ' ')}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${(score/15)*100}%` }}></div>
                        </div>
                        <span className="font-black text-slate-400 text-xs">{score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
                  <button onClick={() => navigate('/result')} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">View Full Details</button>
                  <button onClick={() => window.print()} className="px-8 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs">Print</button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-secondary" /> Assessment Details
                  </h3>
                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Company</p>
                      <p className="font-semibold text-slate-700 uppercase">TechMasters Innovations Private Limited</p>
                    </div>
                    <Activity className="text-slate-300" />
                  </div>

                  <div className="overflow-hidden rounded-3xl border-2 border-slate-100 p-2">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Component</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Questions</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Section A Header */}
                        <tr className="bg-indigo-50/50">
                          <td colSpan="3" className="px-6 py-3 text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                            Section A: Foundation (35 Minutes)
                          </td>
                        </tr>
                        {sections.filter(s => s.section.startsWith('A:')).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-6 py-4 text-slate-700 font-bold">{s.name}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-center">{s.qcount}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-center">{s.time} Min</td>
                          </tr>
                        ))}
                        
                        {/* Section B Header */}
                        <tr className="bg-indigo-50/50">
                          <td colSpan="3" className="px-6 py-3 text-[11px] font-black text-indigo-600 uppercase tracking-widest border-t border-slate-100">
                            Section B: Advance (30 Minutes)
                          </td>
                        </tr>
                        {sections.filter(s => s.section.startsWith('B:')).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-6 py-4 text-slate-700 font-bold">{s.name}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-center">{s.qcount}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono text-center">{s.time} Min</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => navigate('/assessment')}
                    className="btn-primary flex items-center px-8 py-3"
                  >
                    START ASSESSMENT <Send className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats/Profile Side */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary to-blue-700 text-white p-6 rounded-xl shadow-lg border-none">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" /> Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-80">Total Duration</span>
                  <span className="font-bold">65+ Minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-80">Difficulty Level</span>
                  <span className="font-bold uppercase">Moderate-Advanced</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full mt-4">
                  <div className="h-full bg-accent rounded-full w-0 transition-all duration-1000" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Important Rules</h3>
              <ul className="text-sm text-slate-500 space-y-3">
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
