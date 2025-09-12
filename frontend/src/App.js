import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import PunchLogger from './components/PunchLogger';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="nav">
          <div className="container">
            <Link to="/">PunchTracker</Link>
            <Link to="/login">Login</Link>
            <Link to="/log-punch">Log Punch</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>
        
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/log-punch" element={<PunchLogger />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
