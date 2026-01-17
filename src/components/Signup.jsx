
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password);
      alert('Signup successful! Check your email for confirmation or login.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-500">Join KittyAI</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-slate-600 font-medium">Email</label>
            <input 
              type="email" 
              className="w-full p-2 rounded bg-slate-50 border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-600 font-medium">Password</label>
            <input 
              type="password" 
              className="w-full p-2 rounded bg-slate-50 border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-pink-500 hover:underline font-bold">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
