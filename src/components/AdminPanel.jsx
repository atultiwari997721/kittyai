
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth(); // Assuming useAuth exposes 'user'
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
        // Simple security check by email (Real app should check 'role' from profile)
        const admins = ['abecsa@abecsa.in', 'atultiwari997721@gmail.com'];
        if (!user || !admins.includes(user.email.toLowerCase())) {
            navigate('/login');
            return;
        }
        fetchUsers();
    }
  }, [user, authLoading, navigate]);

  const fetchUsers = async () => {
    // SECURITY NOTE: This fetches ALL profiles.
    // In a real app, RLS should strict this to admin only.
    // For this demo, we assume the logged in user is authorized or we just show all.
    const { data, error } = await supabase.from('profiles').select('*');
    if (data) setUsers(data);
    setLoading(false);
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/set-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newPlan })
        });
        const res = await response.json();
        if (response.ok) {
            alert(res.message);
            fetchUsers();
        } else {
            alert(res.error);
        }
    } catch (e) {
        alert('Failed to update plan');
    }
  };

  const deleteUser = async (userId) => {
      if (!window.confirm('Are you sure you want to DELETE this user? This action cannot be undone.')) return;
      
      try {
          const response = await fetch(`http://localhost:5000/api/admin/delete-user/${userId}`, {
              method: 'DELETE'
          });
          const res = await response.json();
          if (response.ok) {
              alert(res.message);
              fetchUsers(); // Refresh list
          } else {
              alert(res.error);
          }
      } catch (err) {
          alert('Failed to delete user');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Admin Control Panel</h1>
      
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider">
                    <tr>
                        <th className="p-5">User ID</th>
                        <th className="p-5">Email</th>
                        <th className="p-5">Current Plan</th>
                        <th className="p-5">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                            <td className="p-5 font-mono text-xs text-slate-400 truncate max-w-[150px]">{user.id}</td>
                            <td className="p-5 font-medium">{user.email || 'No Email'}</td>
                            <td className="p-5">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                    user.plan === 'platinum' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                    user.plan === 'premium' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    'bg-slate-200 text-slate-600'
                                }`}>
                                    {user.plan}
                                </span>
                            </td>
                            <td className="p-5 flex gap-2 items-center">
                                <div className="flex gap-1 mr-4">
                                    <button 
                                        onClick={() => updateUserPlan(user.id, 'free')}
                                        className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-semibold shadow-sm text-slate-600"
                                    >
                                        Free
                                    </button>
                                    <button 
                                        onClick={() => updateUserPlan(user.id, 'premium')}
                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold shadow-sm text-white"
                                    >
                                        Premium
                                    </button>
                                    <button 
                                        onClick={() => updateUserPlan(user.id, 'platinum')}
                                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-xs font-bold shadow-sm text-white"
                                    >
                                        Platinum
                                    </button>
                                </div>
                                <button 
                                    onClick={() => deleteUser(user.id)}
                                    className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-xs font-bold transition ml-auto"
                                    title="Delete User"
                                >
                                    🗑️ Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {loading && <div className="p-8 text-center text-slate-400">Loading users...</div>}
      </div>
    </div>
  );
};

export default AdminPanel;
