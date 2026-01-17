
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [credentials, setCredentials] = useState({
    service_username: '',
    service_password: '',
    service_name: 'instagram'
  });
  const [taskDetails, setTaskDetails] = useState({
    imageUrl: '',
    caption: '',
    code: '',
    repoName: '',
    fileName: ''
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('automation_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    // Save to DB (Basic implementation)
    const { error } = await supabase.from('service_credentials').insert({
        user_id: user.id,
        service_name: credentials.service_name,
        service_username: credentials.service_username,
        service_password: credentials.service_password
    });
    if (error) alert('Error saving credentials: ' + error.message);
    else alert('Credentials saved!');
  };

  const triggerAutomation = async (type) => {
    if (profile?.plan === 'free') {
        alert('Please upgrade to Premium to use automation!');
        return;
    }

    setLoading(true);
    try {
        const response = await fetch('http://localhost:5000/api/automation/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                taskType: type,
                details: taskDetails
            })
        });
        const res = await response.json();
        if (response.ok) {
            alert(res.message);
            fetchTasks();
        } else {
            alert(res.error);
        }
    } catch (err) {
        alert('Server connection error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600">
              User Dashboard
            </h1>
            <p className="text-slate-500">Welcome back, {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${
                profile?.plan === 'platinum' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                profile?.plan === 'premium' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                'bg-slate-200 text-slate-700'
            }`}>
                {profile?.plan || 'Free'} Plan
            </span>
            <button onClick={logout} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow">
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Credentials Section */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-sm">1</span> 
              Connect Accounts
            </h2>
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="relative">
                <select 
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none appearance-none"
                  value={credentials.service_name}
                  onChange={e => setCredentials({...credentials, service_name: e.target.value})}
                >
                  <option value="instagram">Instagram</option>
                  <option value="github">GitHub</option>
                  <option value="facebook">Facebook</option>
                </select>
                <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">▼</div>
              </div>

              <input 
                type="text" placeholder="Username / Email"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition"
                value={credentials.service_username}
                onChange={e => setCredentials({...credentials, service_username: e.target.value})}
              />
              <input 
                type="password" placeholder="Password / GitHub Personal Access Token"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition"
                value={credentials.service_password}
                onChange={e => setCredentials({...credentials, service_password: e.target.value})}
              />
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition transform active:scale-95">
                Save Credentials (Token)
              </button>
            </form>
          </div>

          {/* Automation Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span> 
              Run Automation
            </h2>
            
            <div className="space-y-6">
                {/* Instagram Automation */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-3 text-slate-700">Instagram Post</h3>
                    <input 
                        type="text" placeholder="Image URL" className="w-full mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:border-purple-400 outline-none"
                        onChange={e => setTaskDetails({...taskDetails, imageUrl: e.target.value})}
                    />
                    <input 
                        type="text" placeholder="Caption" className="w-full mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:border-purple-400 outline-none"
                        onChange={e => setTaskDetails({...taskDetails, caption: e.target.value})}
                    />
                    <button 
                        onClick={() => triggerAutomation('instagram_post')}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg text-sm font-bold shadow-md transition"
                    >
                        {loading ? 'Processing...' : 'Post to Instagram'}
                    </button>
                </div>

                {/* Github Automation */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-3 text-slate-700">GitHub Code Post</h3>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" placeholder="Repo Name" className="w-1/2 p-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:border-slate-400 outline-none"
                            onChange={e => setTaskDetails({...taskDetails, repoName: e.target.value})}
                        />
                        <input 
                            type="text" placeholder="File.py" className="w-1/2 p-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:border-slate-400 outline-none"
                            onChange={e => setTaskDetails({...taskDetails, fileName: e.target.value})}
                        />
                    </div>
                    <textarea 
                        placeholder="Code content..." className="w-full mb-3 p-2.5 rounded-lg bg-white border border-slate-200 text-sm h-24 font-mono focus:border-slate-400 outline-none resize-none"
                        onChange={e => setTaskDetails({...taskDetails, code: e.target.value})}
                    />
                    <button 
                        onClick={() => triggerAutomation('github_post')}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-black text-white py-2 rounded-lg text-sm font-bold shadow-md transition"
                    >
                        {loading ? 'Processing...' : 'Push to GitHub'}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Task History */}
        <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Automation History</h2>
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="p-5">Type</th>
                            <th className="p-5">Status</th>
                            <th className="p-5">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-5 font-medium text-slate-700">{task.task_type}</td>
                                <td className="p-5">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        task.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="p-5 text-slate-500 text-sm">{new Date(task.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tasks.length === 0 && <div className="p-10 text-center text-slate-400 italic">No tasks found. Start automating!</div>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
