import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  Activity, DollarSign, Zap, AlertTriangle, Key, Plus
} from 'lucide-react';

const Dashboard = () => {
  const { projects, setProjects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Fetch metrics when project changes
  useEffect(() => {
    if (selectedProject) {
      const fetchMetrics = async () => {
        setLoadingMetrics(true);
        try {
          const res = await api.get(`/metrics/?project_id=${selectedProject.id}`);
          setMetrics(res.data);
        } catch (err) {
          console.error("Failed to fetch metrics", err);
        } finally {
          setLoadingMetrics(false);
        }
      };
      fetchMetrics();
    }
  }, [selectedProject]);

  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (!name) return;
    try {
      const res = await api.post('/projects/', { name });
      setProjects([...projects, res.data]);
      setSelectedProject(res.data);
    } catch (err) {
      alert("Failed to create project");
    }
  };


  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;

  return (
    <div className="p-8 h-full overflow-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Overview of your LLM applications performance.</p>
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
          <button onClick={handleCreateProject} className="btn-primary flex items-center space-x-2">
            <Plus size={18} /> <span>New Project</span>
          </button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-white/10">
            <Activity size={32} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Create your first project to generate an API key and start monitoring your LLM application.
          </p>
          <button onClick={handleCreateProject} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <>
          {/* API Key Banner */}
          <div className="glass-panel p-4 mb-8 flex items-center justify-between border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-center space-x-3">
              <Key className="text-primary" size={20} />
              <div>
                <span className="text-sm text-gray-400 block">Project API Key</span>
                <code className="text-gray-200 font-mono text-sm">{selectedProject.api_key}</code>
              </div>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(selectedProject.api_key);
                alert("API key copied to clipboard!");
              }}
              className="btn-secondary text-sm py-1.5"
            >
              Copy Key
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Total Requests" 
              value={metrics?.total_requests || 0} 
              icon={<Activity className="text-blue-400" size={24} />}
              trend="+12%"
            />
            <MetricCard 
              title="Total Cost" 
              value={`$${(metrics?.total_cost || 0).toFixed(4)}`} 
              icon={<DollarSign className="text-emerald-400" size={24} />}
              trend="+5%"
            />
            <MetricCard 
              title="Avg Latency" 
              value={`${(metrics?.average_latency || 0).toFixed(0)} ms`} 
              icon={<Zap className="text-amber-400" size={24} />}
              trend="-2%"
            />
            <MetricCard 
              title="Error Rate" 
              value={`${(metrics?.error_rate || 0).toFixed(2)}%`} 
              icon={<AlertTriangle className="text-red-400" size={24} />}
              trend="0%"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-6">Requests Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics?.timeseries || []}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151C2C', borderColor: '#ffffff20', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-6">Cost Analysis (USD)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.timeseries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151C2C', borderColor: '#ffffff20', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: '#ffffff05' }}
                    />
                    <Bar dataKey="cost" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon, trend }) => (
  <div className="glass-panel p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-all duration-500" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-white">{value}</h4>
      </div>
      <div className="p-3 bg-surface rounded-xl border border-white/5">
        {icon}
      </div>
    </div>
    <div className="flex items-center space-x-2 relative z-10">
      <span className={`text-sm font-medium ${trend.startsWith('+') ? (trend.includes('%') && !trend.includes('12') ? 'text-red-400' : 'text-emerald-400') : 'text-emerald-400'}`}>
        {trend}
      </span>
      <span className="text-gray-500 text-sm">vs last 7 days</span>
    </div>
  </div>
);

export default Dashboard;
