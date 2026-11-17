import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Traces from './pages/Traces';
import Evaluations from './pages/Evaluations';
import Alerts from './pages/Alerts';
import Playground from './pages/Playground';
import CodeRunner from './pages/CodeRunner';
import Prompts from './pages/Prompts';
import { ProjectProvider } from './context/ProjectContext';
import { PlaygroundProvider } from './context/PlaygroundContext';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  
  return (
    <ProjectProvider>
      <PlaygroundProvider>
        <div className="flex h-screen bg-background overflow-hidden text-gray-100">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </PlaygroundProvider>
    </ProjectProvider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/code-runner" element={<CodeRunner />} />
              <Route path="/traces" element={<Traces />} />
              <Route path="/evaluations" element={<Evaluations />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
