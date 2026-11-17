import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { BookOpen, Plus, Save } from 'lucide-react';

const Prompts = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [template, setTemplate] = useState('');
  
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');



  useEffect(() => {
    if (selectedProject) {
      fetchPrompts();
    }
  }, [selectedProject]);

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await api.get(`/prompts/?project_id=${selectedProject.id}`);
      setPrompts(res.data);
    } catch (err) {
      console.error("Failed to fetch prompts", err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/prompts/?project_id=${selectedProject.id}`, {
        name: newPromptName
      });
      setShowNewPrompt(false);
      setNewPromptName('');
      fetchPrompts();
      
      // Auto select the new prompt
      setSelectedPrompt(res.data);
      setTemplate('');
    } catch (err) {
      console.error("Failed to create prompt", err);
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedPrompt) return;
    
    try {
      await api.post(`/prompts/${selectedPrompt.id}/versions`, {
        version_tag: "v" + (selectedPrompt.versions.length + 1),
        template: template,
        model: "llama3.2"
      });
      alert("Saved new version!");
      fetchPrompts();
    } catch (err) {
      console.error("Failed to save version", err);
      alert("Failed to save");
    }
  };

  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading prompts...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in flex gap-6">
      {/* Sidebar for Prompts */}
      <div className="w-1/3 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen size={28} className="text-primary" />
            Prompts
          </h1>
          <p className="text-gray-400 text-sm mb-4">Manage and version your system prompts.</p>
        </div>

        <select 
          className="input-field bg-surface border-white/10"
          value={selectedProject?.id || ''}
          onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        <button 
          onClick={() => setShowNewPrompt(!showNewPrompt)} 
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} /> New Prompt
        </button>
        
        {showNewPrompt && (
          <form onSubmit={handleCreatePrompt} className="glass-panel p-4 flex flex-col gap-3">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Prompt Name (e.g. Support Bot)" 
              value={newPromptName}
              onChange={e => setNewPromptName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary py-1.5 text-sm">Create</button>
          </form>
        )}

        <div className="flex flex-col gap-2 mt-2">
          {prompts.map(p => (
            <button 
              key={p.id}
              onClick={() => {
                setSelectedPrompt(p);
                setTemplate(p.versions?.length > 0 ? p.versions[p.versions.length-1].template : '');
              }}
              className={`text-left p-4 rounded-xl border transition-all ${selectedPrompt?.id === p.id ? 'bg-primary/20 border-primary text-white' : 'bg-surface border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="font-bold">{p.name}</div>
              <div className="text-xs opacity-70 mt-1">
                {p.versions?.length || 0} versions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedPrompt ? (
          <div className="glass-panel p-6 flex flex-col h-full border border-primary/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedPrompt.name}</h2>
                <div className="text-sm text-gray-400 mt-1">
                  Current Version: v{(selectedPrompt.versions?.length || 0) + (selectedPrompt.versions?.length > 0 && selectedPrompt.versions[selectedPrompt.versions.length-1].template === template ? 0 : 1)}
                </div>
              </div>
              <button onClick={handleSaveVersion} className="btn-primary flex items-center gap-2">
                <Save size={18} /> Save as New Version
              </button>
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="text-sm text-gray-400 mb-2 font-bold">System Prompt Template</label>
              <textarea 
                className="input-field flex-1 font-mono text-sm leading-relaxed resize-none bg-black/40" 
                placeholder="You are a helpful assistant..."
                value={template}
                onChange={e => setTemplate(e.target.value)}
              />
            </div>
            
            <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 text-sm text-primary">
              <p><strong>Tip:</strong> Variables like <code className="bg-black/40 px-1 rounded">{"{context}"}</code> will be automatically replaced by the RAG engine.</p>
            </div>
          </div>
        ) : (
          <div className="glass-panel flex-1 flex flex-col items-center justify-center text-center p-12 border border-white/5">
            <BookOpen size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Select a Prompt</h3>
            <p className="text-gray-500 max-w-md mt-2">
              Choose a prompt from the sidebar or create a new one to start editing your system instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prompts;
