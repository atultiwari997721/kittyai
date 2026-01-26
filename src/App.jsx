import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SmartSearch from './components/SmartSearch';
import CreativeStudio from './components/CreativeStudio';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import WhatsAppSender from './pages/WhatsAppSender';
import KittyInstaAi from './pages/KittyInstaAi';
import { AuthProvider } from './context/AuthContext';

// Wrapper to conditionally render specific layout elements if needed
const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup', '/dashboard', '/admin', '/kittyinsta'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/search" element={<SmartSearch />} />
        <Route path="/creative" element={<CreativeStudio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/whatsapp" element={<WhatsAppSender />} />
        <Route path="/kittyinsta" element={<KittyInstaAi />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
