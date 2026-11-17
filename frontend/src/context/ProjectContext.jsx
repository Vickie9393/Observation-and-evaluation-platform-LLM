import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ProjectContext = createContext(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data);
      
      if (res.data.length > 0) {
        setSelectedProject(prev => {
          if (!prev || !res.data.find(p => p.id === prev.id)) {
            return res.data[0];
          }
          return res.data.find(p => p.id === prev.id);
        });
      } else {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    projects,
    setProjects,
    selectedProject,
    setSelectedProject,
    loading,
    refreshProjects: fetchProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
