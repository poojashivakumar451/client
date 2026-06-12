import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Award } from 'lucide-react';

const Completed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalScore, maxScore } = location.state || { totalScore: 0, maxScore: 0 };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-12 text-center border border-slate-100 animate-fade-in">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 leading-tight">Assessment Completed Successfully</h1>
        
        {location.state ? (
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
            <Award className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Your Score</p>
            <div className="text-4xl font-black text-slate-800">
              {totalScore} <span className="text-xl text-slate-400">/ {maxScore}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-slate-500 mb-8 font-medium">
            Results stored securely.
          </div>
        )}

        <button 
          onClick={() => navigate('/result')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-100"
        >
          View Detailed Scorecard
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Completed;
