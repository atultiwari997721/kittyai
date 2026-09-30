import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './components/MainApp';
import Hero from './components/Hero';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0d14] text-slate-100 selection:bg-fuchsia-500 selection:text-white font-sans antialiased">
          <Routes>
            {/* The Primary KittyAI Unified Assistant App */}
            <Route path="/" element={<MainApp />} />
            <Route path="/chat" element={<MainApp />} />
            <Route path="/tasks" element={<MainApp />} />
            <Route path="/controls" element={<MainApp />} />
            <Route path="/dashboard" element={<MainApp />} />
            <Route path="/plugins" element={<MainApp />} />
            <Route path="/settings" element={<MainApp />} />
            <Route path="/memory" element={<MainApp />} />
            <Route path="/download" element={<MainApp />} />
            <Route path="/downloads" element={<MainApp />} />

            {/* Landing page overview if needed */}
            <Route path="/landing" element={<Hero />} />

            {/* Fallback to MainApp */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
