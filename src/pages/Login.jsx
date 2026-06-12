import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // MASTER ACCOUNT FALLBACK
    if (email === 'techmasterstrainings@gmail.com' && password === 'Fri10Feb@2023') {
      const masterData = { 
        uid: 'master-admin', 
        email: email, 
        name: 'TechMasters Admin', 
        role: 'admin' 
      };
      sessionStorage.setItem('masterUser', JSON.stringify(masterData));
      toast.success('Admin Login Successful');
      
      // Force clean redirect to Dashboard
      window.location.href = '/'; 
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login Successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials or user not found');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error('Please enter your email first');
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-slate-900 to-black p-4">
      <div className="max-w-md w-full glass p-6 sm:p-8 rounded-2xl animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-secondary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">TechMasters</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Assessment Portal Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Mail className="w-4 h-4 mr-2" /> Email Address
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="student@techmasters.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Lock className="w-4 h-4 mr-2" /> Password
            </label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-secondary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Login
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Powered by TechMasters Innovations Private Limited
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
