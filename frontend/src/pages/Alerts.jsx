import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';

const Alerts = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  
  // New alert form state
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState('error_rate_greater_than');
  const [newThreshold, setNewThreshold] = useState('5.0');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [creating, setCreating] = useState(false);



  useEffect(() => {
    if (selectedProject) {
      fetchAlerts();
    }
  }, [selectedProject]);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await api.get(`/alerts/?project_id=${selectedProject.id}`);
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/alerts/?project_id=${selectedProject.id}`, {
        name: newName,
        condition: newCondition,
        threshold: parseFloat(newThreshold),
        webhook_url: newWebhookUrl || null
      });
      setShowForm(false);
      setNewName('');
      setNewThreshold('5.0');
      setNewWebhookUrl('');
      fetchAlerts();
    } catch (err) {
      console.error("Failed to create alert", err);
      alert("Failed to create alert");
    } finally {
      setCreating(false);
    }
  };

  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading alerts...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Bell size={28} className="text-primary" />
            Alerts
          </h1>
          <p className="text-gray-400">Configure notifications for anomalies in your traces.</p>
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
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} /> <span>New Alert</span>
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="glass-panel p-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Please create a project first from the dashboard.
          </p>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="glass-panel p-6 mb-8 border border-primary/30 relative">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Alert</h3>
              <form onSubmit={handleCreateAlert} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Alert Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. High Error Rate" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Condition</label>
                  <select 
                    className="input-field"
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                  >
                    <option value="error_rate_greater_than">Error Rate &gt;</option>
                    <option value="latency_greater_than">Avg Latency (ms) &gt;</option>
                    <option value="cost_greater_than">Total Cost ($) &gt;</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Threshold</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    value={newThreshold}
                    onChange={e => setNewThreshold(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Webhook URL (Optional)</label>
                  <input 
                    type="url"
                    className="input-field" 
                    placeholder="https://hooks.slack.com/..." 
                    value={newWebhookUrl}
                    onChange={e => setNewWebhookUrl(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={creating} className="btn-primary py-2.5">
                  {creating ? 'Saving...' : 'Save Alert'}
                </button>
              </form>
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-white/10 mx-auto">
                <AlertTriangle size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Alerts Configured</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Set up alerts to get notified when error rates spike or latency gets too high.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map(alert => (
                <div key={alert.id} className="glass-panel p-6 border-t-4 border-t-amber-500">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{alert.name}</h3>
                    <button className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="bg-surface p-3 rounded-lg border border-white/5 font-mono text-sm text-gray-300">
                    <span className="text-primary">{alert.condition}</span> <span className="text-white">{alert.threshold}</span>
                  </div>
                  
                  {/* Alert Events Section */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs uppercase font-bold text-gray-500 mb-2 flex justify-between items-center">
                      <span>Event History</span>
                      {alert.events && alert.events.length > 0 && (
                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px]">
                          {alert.events.length} triggered
                        </span>
                      )}
                    </h4>
                    
                    {(!alert.events || alert.events.length === 0) ? (
                      <p className="text-xs text-gray-500 italic">No events triggered yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {alert.events.slice().reverse().map(event => (
                          <div key={event.id} className="bg-black/20 p-2 rounded border border-red-500/10">
                            <div className="text-[10px] text-gray-500 mb-1">
                              {new Date(event.created_at + 'Z').toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-300">
                              {event.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Alerts;
