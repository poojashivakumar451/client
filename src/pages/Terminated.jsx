import React from 'react';
import { ShieldAlert, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terminated = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border-4 border-red-500 animate-bounce-short">
        <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-red-600 mb-4 tracking-tighter">ASSESSMENT TERMINATED</h1>
        <p className="text-slate-800 font-bold text-lg mb-6 uppercase">Malpractice Detected</p>
        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 italic text-slate-500 text-sm">
          "Your session was invalidated due to a security violation (Tab switching, Window blur, or Fullscreen exit)."
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Return to Login
        </button>
        <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Incident logged & account locked</p>
      </div>
    </div>
  );
};

export default Terminated;
