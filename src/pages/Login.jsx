import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, Mail, Lock, ShieldCheck, User, Building, Hash } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [usn, setUsn] = useState('');
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
      const studentData = { name, email, college, usn, role: 'student', registeredAt: new Date().toISOString() };
      
      // Store in Firebase immediately so admins can see who registered
      try {
        await addDoc(collection(db, "registered_students"), studentData);
      } catch (fbError) {
        console.error("Firebase registration error: ", fbError);
        // Continue even if logging fails
      }

      sessionStorage.setItem('studentUser', JSON.stringify(studentData));
      toast.success('Registration Successful! Starting Assessment...');
      window.location.href = '/';
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-slate-900 to-black p-4 py-10">
      <div className="max-w-md w-full glass p-6 sm:p-8 rounded-2xl animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-secondary/10 rounded-full">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-secondary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">TechMasters</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">Assessment Portal Registration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <User className="w-4 h-4 mr-2" /> Full Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Mail className="w-4 h-4 mr-2" /> Email Address
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Building className="w-4 h-4 mr-2" /> College Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Your College Name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <Hash className="w-4 h-4 mr-2" /> USN / Roll No
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="1XX20XX000"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
            />
          </div>

          {email === 'techmasterstrainings@gmail.com' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Lock className="w-4 h-4 mr-2" /> Admin Passcode
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center mt-6"
          >
            {loading ? 'Processing...' : (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Register & Start
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
