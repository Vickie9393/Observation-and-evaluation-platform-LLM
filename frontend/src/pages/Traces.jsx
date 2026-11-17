import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { Activity, Clock, DollarSign, Database, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

const Traces = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  const [traces, setTraces] = useState([]);
  const [loadingTraces, setLoadingTraces] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      const fetchTraces = async () => {
        setLoadingTraces(true);
        try {
          const res = await api.get(`/traces/?project_id=${selectedProject.id}`);
          setTraces(res.data);
        } catch (err) {
          console.error("Failed to fetch traces", err);
        } finally {
          setLoadingTraces(false);
        }
      };
      fetchTraces();
    }
  }, [selectedProject]);

  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading traces...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Activity size={28} className="text-primary" />
            Traces
          </h1>
          <p className="text-gray-400">View and inspect every LLM request sent from your application.</p>
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
            Please create a project first from the dashboard to view traces.
          </p>
        </div>
      ) : traces.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No Traces Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the MiniObserve SDK or API to send your first trace to this project.
          </p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium text-gray-300 text-sm">Status</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Timestamp</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Model</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Tokens</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Latency</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Cost</th>
                  <th className="p-4 font-medium text-gray-300 text-sm"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {traces.map(trace => (
                  <React.Fragment key={trace.id}>
                    <tr 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedTraceId(expandedTraceId === trace.id ? null : trace.id)}
                    >
                      <td className="p-4">
                        {trace.status === 'error' ? (
                          <span className="flex items-center text-red-400 gap-1"><XCircle size={16} /> Error</span>
                        ) : (
                          <span className="flex items-center text-emerald-400 gap-1"><CheckCircle size={16} /> Success</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-300">{new Date(trace.timestamp + 'Z').toLocaleString()}</td>
                      <td className="p-4 text-gray-300"><span className="px-2 py-1 bg-white/10 rounded text-xs">{trace.model}</span></td>
                      <td className="p-4 text-gray-300">{trace.total_tokens}</td>
                      <td className="p-4 text-gray-300">{trace.latency_ms.toFixed(0)} ms</td>
                      <td className="p-4 text-gray-300">${trace.cost.toFixed(6)}</td>
                      <td className="p-4 text-gray-500">
                        {expandedTraceId === trace.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </td>
                    </tr>
                    {expandedTraceId === trace.id && (
                      <tr className="bg-black/20 border-b border-white/5">
                        <td colSpan="7" className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Prompt</h4>
                              <div className="bg-surface p-4 rounded-lg border border-white/5 text-gray-200 whitespace-pre-wrap font-mono text-sm">
                                {trace.prompt}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Response</h4>
                              <div className={`bg-surface p-4 rounded-lg border border-white/5 text-gray-200 whitespace-pre-wrap font-mono text-sm ${trace.status === 'error' ? 'text-red-400 border-red-500/30' : ''}`}>
                                {trace.status === 'error' ? trace.error_message : trace.response}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Traces;
