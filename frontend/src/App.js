import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import PunchLogger from './components/PunchLogger';
import Dashboard from './components/Dashboard';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-surface border-b border-[#242a35] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black text-text">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span>
          </h1>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/log-punch" 
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/log-punch') 
                ? 'bg-primary text-white' 
                : 'text-muted hover:text-text hover:bg-surface2'
            }`}
          >
            Log Punch
          </Link>
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isActive('/dashboard') 
                ? 'bg-primary text-white' 
                : 'text-muted hover:text-text hover:bg-surface2'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/log-punch" element={
            <>
              <Navigation />
              <div className="max-w-7xl mx-auto px-6 py-8">
                <PunchLogger />
              </div>
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navigation />
              <div className="max-w-7xl mx-auto px-6 py-8">
                <Dashboard />
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
