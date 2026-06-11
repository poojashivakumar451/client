import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ShieldAlert, Monitor } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Instructions = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const rules = [
    "No tab switching allowed. (Auto-submit on violation)",
    "No copy, paste, or right-click allowed.",
    "No opening developer tools (F12, etc.).",
    "Full screen mode is mandatory throughout the test.",
    "Internet disconnection will show a warning.",
    "Questions cannot be revisited after section submission.",
    "Timer cannot be paused under any circumstances.",
    "Multiple monitors or screen recording will be logged.",
  ];

  const handleStart = () => {
    if (!agreed) return toast.error("Please agree to the instructions first");
    
    // Attempt to enter full screen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {
        toast.error("Fullscreen permission denied. Please enable it to proceed.");
      });
    }
    
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-slate-100">
        <div className="bg-primary p-8 text-white text-center">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse" />
          <h1 className="text-3xl font-bold">Assessment Instructions</h1>
          <p className="mt-2 text-slate-300">Please read carefully before starting the test.</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-start text-amber-800">
            <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
            <div>
              <h4 className="font-bold">System Warning</h4>
              <p className="text-sm opacity-90">Closing full screen or switching tabs will result in IMMEDIATE termination of your test with a malpractice log.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-sm text-slate-600 font-medium">{rule}</span>
              </div>
            ))}
          </div>

          <div className="bg-red-50 p-6 rounded-2xl flex items-center gap-4">
            <ShieldAlert className="w-10 h-10 text-red-500 shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-semibold uppercase tracking-wider mb-1">Strict Policy</p>
              <p className="text-sm text-slate-600">Every violation is logged and your account will be locked for further investigation.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary transition-all"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
              />
              <span className="text-slate-700 font-medium group-hover:text-slate-900">I have read and understood all the instructions and rules.</span>
            </label>

            <button
              onClick={handleStart}
              className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${
                agreed 
                ? 'bg-secondary text-white shadow-lg shadow-blue-200 hover:-translate-y-1 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              START TEST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
