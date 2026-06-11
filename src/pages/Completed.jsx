import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

const Completed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100 animate-fade-in">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Assessment Completed Successfully</h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 mb-8 font-medium">
          <Loader2 className="w-5 h-5 animate-spin" /> Calculating Result...
        </div>
        <p className="text-sm text-slate-400">Please do not close this window while we finalize your scores.</p>
      </div>
    </div>
  );
};

export default Completed;
