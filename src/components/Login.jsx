
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      console.log('Attempting login for:', cleanEmail);
      
      const { user } = await login(cleanEmail, password);
      console.log('Login successful, user:', user);

      if (['abecsa@abecsa.in', 'atultiwari997721@gmail.com'].includes(cleanEmail)) {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Supabase generic error message can be vague
      if (err.message.includes('Invalid login credentials')) {
         setError('Invalid credentials. Please check for typos and ensure email is confirmed.');
      } else {
         setError(err.message);
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-600">Login to KittyAI</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-slate-600 font-medium">Email</label>
            <input 
              type="email" 
              className="w-full p-2 rounded bg-slate-50 border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-600 font-medium">Password</label>
            <input 
              type="password" 
              className="w-full p-2 rounded bg-slate-50 border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don't have an account? <a href="/signup" className="text-cyan-600 hover:underline font-bold">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
