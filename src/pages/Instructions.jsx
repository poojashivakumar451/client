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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 sm:py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-slate-100">
        <div className="bg-primary p-6 sm:p-8 text-white text-center">
          <Monitor className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-accent animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-bold">Assessment Instructions</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">Please read carefully before starting the test.</p>
        </div>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-start text-amber-800">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm sm:text-base">System Warning</h4>
              <p className="text-xs sm:text-sm opacity-90">Closing full screen or switching tabs will result in IMMEDIATE termination of your test with a malpractice log.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-600 font-medium">{rule}</span>
              </div>
            ))}
          </div>

          <div className="bg-red-50 p-4 sm:p-6 rounded-2xl flex items-start sm:items-center gap-4">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-xs sm:text-sm text-red-700 font-semibold uppercase tracking-wider mb-1">Strict Policy</p>
              <p className="text-xs sm:text-sm text-slate-600">Every violation is logged and your account will be locked for further investigation.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 mt-0.5 sm:mt-0 rounded border-slate-300 text-secondary focus:ring-secondary transition-all"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-slate-900">I have read and understood all the instructions and rules.</span>
            </label>

            <button
              onClick={handleStart}
              className={`w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all ${
                agreed 
                ? 'bg-secondary text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:scale-95' 
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
