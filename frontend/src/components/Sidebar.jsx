import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Activity, ShieldAlert, Settings, LogOut, Terminal, Code } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Playground', path: '/playground', icon: <Terminal size={20} /> },
    { name: 'Code Runner', path: '/code-runner', icon: <Code size={20} /> },
    { name: 'Traces', path: '/traces', icon: <List size={20} /> },
    { name: 'Evaluations', path: '/evaluations', icon: <Activity size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <ShieldAlert size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-surface h-screen border-r border-white/10 flex flex-col pt-6">
      <div className="px-6 mb-8 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 text-white font-bold text-xl animate-fade-in">
          M
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          MiniObserve
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.15)]'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
