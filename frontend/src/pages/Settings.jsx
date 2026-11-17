import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { Settings as SettingsIcon, Save, Trash2 } from 'lucide-react';

const Settings = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading, refreshProjects } = useProject();
  const [loadingKeys, setLoadingKeys] = useState(true);
  
  // Local state for the settings form
  const [relevanceEnabled, setRelevanceEnabled] = useState(true);
  const [groundednessEnabled, setGroundednessEnabled] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [systemKeys, setSystemKeys] = useState({});

  useEffect(() => {
    const fetchSystemKeys = async () => {
      try {
        const sysRes = await api.get('/projects/system-keys');
        setSystemKeys(sysRes.data);
      } catch (err) {
        console.error("Failed to fetch system keys", err);
      } finally {
        setLoadingKeys(false);
      }
    };
    fetchSystemKeys();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setRelevanceEnabled(selectedProject.eval_relevance_enabled);
      setGroundednessEnabled(selectedProject.eval_groundedness_enabled);
      setOpenaiApiKey(selectedProject.openai_api_key || '');
      setAnthropicApiKey(selectedProject.anthropic_api_key || '');
      setGeminiApiKey(selectedProject.gemini_api_key || '');
      setGroqApiKey(selectedProject.groq_api_key || '');
    }
  }, [selectedProject]);

  const handleSave = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const res = await api.put(`/projects/${selectedProject.id}`, {
        eval_relevance_enabled: relevanceEnabled,
        eval_groundedness_enabled: groundednessEnabled,
        openai_api_key: openaiApiKey || null,
        anthropic_api_key: anthropicApiKey || null,
        gemini_api_key: geminiApiKey || null,
        groq_api_key: groqApiKey || null
      });
      // Refresh global projects to reflect changes
      await refreshProjects();
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!window.confirm(`Are you sure you want to delete the project "${selectedProject.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/projects/${selectedProject.id}`);
      await refreshProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete project");
    }
  };

  if (projectsLoading || loadingKeys) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <SettingsIcon size={28} className="text-primary" />
            Project Settings
          </h1>
          <p className="text-gray-400">Configure your LLM application's evaluation preferences.</p>
        </div>

        <div className="flex items-center space-x-4">
          <select 
            className="input-field w-48 bg-surface border-white/10"
            value={selectedProject?.id || ''}
            onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
          >
            {projects.length === 0 && <option value="">No projects</option>}
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <div className="glass-panel p-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Please create a project first from the dashboard to manage its settings.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-8 max-w-3xl">
          <h3 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Trace Evaluations</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div>
                <h4 className="text-white font-medium mb-1">Evaluate Relevance</h4>
                <p className="text-sm text-gray-400">
                  Automatically score traces on how relevant the LLM response is to the user's prompt.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={relevanceEnabled}
                  onChange={(e) => setRelevanceEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div>
                <h4 className="text-white font-medium mb-1">Evaluate Groundedness</h4>
                <p className="text-sm text-gray-400">
                  Automatically score traces on whether the response is grounded in facts and free of hallucinations.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={groundednessEnabled}
                  onChange={(e) => setGroundednessEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-10 mb-6 border-b border-white/10 pb-4">API Providers</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div className="w-1/3">
                <h4 className="text-white font-medium mb-1">OpenAI API Key</h4>
                <p className="text-sm text-gray-400">For gpt-* models</p>
                {systemKeys.has_openai && <p className="text-xs text-emerald-400 mt-1">Built-in key available. Leave blank to use it.</p>}
              </div>
              <input 
                type="password" 
                placeholder={systemKeys.has_openai ? "Using built-in key..." : "sk-..."}
                className="input-field flex-1 ml-4 bg-black/20 border-white/10 focus:border-primary text-white p-2 rounded-lg"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div className="w-1/3">
                <h4 className="text-white font-medium mb-1">Anthropic API Key</h4>
                <p className="text-sm text-gray-400">For claude-* models</p>
                {systemKeys.has_anthropic && <p className="text-xs text-emerald-400 mt-1">Built-in key available. Leave blank to use it.</p>}
              </div>
              <input 
                type="password" 
                placeholder={systemKeys.has_anthropic ? "Using built-in key..." : "sk-ant-..."}
                className="input-field flex-1 ml-4 bg-black/20 border-white/10 focus:border-primary text-white p-2 rounded-lg"
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div className="w-1/3">
                <h4 className="text-white font-medium mb-1">Gemini API Key</h4>
                <p className="text-sm text-gray-400">For gemini-* models</p>
                {systemKeys.has_gemini && <p className="text-xs text-emerald-400 mt-1">Built-in key available. Leave blank to use it.</p>}
              </div>
              <input 
                type="password" 
                placeholder={systemKeys.has_gemini ? "Using built-in key..." : "AIza..."}
                className="input-field flex-1 ml-4 bg-black/20 border-white/10 focus:border-primary text-white p-2 rounded-lg"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
              <div className="w-1/3">
                <h4 className="text-white font-medium mb-1">Groq API Key</h4>
                <p className="text-sm text-gray-400">For groq/* models</p>
                {systemKeys.has_groq && <p className="text-xs text-emerald-400 mt-1">Built-in key available. Leave blank to use it.</p>}
              </div>
              <input 
                type="password" 
                placeholder={systemKeys.has_groq ? "Using built-in key..." : "gsk_..."}
                className="input-field flex-1 ml-4 bg-black/20 border-white/10 focus:border-primary text-white p-2 rounded-lg"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-red-500/20">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
              <div>
                <h4 className="text-white font-medium mb-1">Delete Project</h4>
                <p className="text-sm text-gray-400">
                  Permanently remove this project and all of its traces, evaluations, and datasets.
                </p>
              </div>
              <button 
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
