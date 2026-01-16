import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SmartSearch from './components/SmartSearch';
import CreativeStudio from './components/CreativeStudio';

// Wrapper to conditionally render specific layout elements if needed
const AppContent = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/search" element={<SmartSearch />} />
        <Route path="/creative" element={<CreativeStudio />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
