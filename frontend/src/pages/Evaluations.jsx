import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { BarChart2, CheckCircle, XCircle } from 'lucide-react';

const Evaluations = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  const [evaluations, setEvaluations] = useState([]);
  const [loadingEvals, setLoadingEvals] = useState(false);



  useEffect(() => {
    if (selectedProject) {
      const fetchEvals = async () => {
        setLoadingEvals(true);
        try {
          const res = await api.get(`/evaluations/?project_id=${selectedProject.id}`);
          setEvaluations(res.data);
        } catch (err) {
          console.error("Failed to fetch evaluations", err);
        } finally {
          setLoadingEvals(false);
        }
      };
      fetchEvals();
    }
  }, [selectedProject]);

  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading evaluations...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <BarChart2 size={28} className="text-primary" />
            Evaluations
          </h1>
          <p className="text-gray-400">Automated quality scores for your LLM traces.</p>
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
            Please create a project first from the dashboard.
          </p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <h3 className="text-xl font-bold text-white mb-2">No Evaluations Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Enable evaluations in Settings and send some traces to see automated scores.
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
                  <th className="p-4 font-medium text-gray-300 text-sm">Evaluator</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Score</th>
                  <th className="p-4 font-medium text-gray-300 text-sm w-1/3">Reason</th>
                  <th className="p-4 font-medium text-gray-300 text-sm">Trace ID</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {evaluations.map(ev => {
                  const passed = ev.score >= 0.7;
                  return (
                  <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      {passed ? (
                        <span className="flex items-center text-emerald-400 gap-1"><CheckCircle size={16} /> Pass</span>
                      ) : (
                        <span className="flex items-center text-red-400 gap-1"><XCircle size={16} /> Fail</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">{new Date(ev.created_at + 'Z').toLocaleString()}</td>
                    <td className="p-4 text-gray-300 font-medium">{ev.evaluator}</td>
                    <td className="p-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passed ? 'bg-emerald-400' : 'bg-red-400'}`}
                            style={{ width: `${ev.score * 100}%` }}
                          />
                        </div>
                        {ev.score.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{ev.reason}</td>
                    <td className="p-4 text-gray-500 text-xs font-mono truncate max-w-[100px]">{ev.trace_id}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluations;
