import React, { useState } from 'react';
import { Code, Terminal } from 'lucide-react';
import WebRunner from '../components/CodeRunner/WebRunner';
import BackendRunner from '../components/CodeRunner/BackendRunner';

const CodeRunner = () => {
  const [activeTab, setActiveTab] = useState('web');

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-background z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code size={24} className="text-primary" />
            Code Runner
          </h1>
          <p className="text-gray-400 text-sm mt-1">Develop and test your code securely in the cloud.</p>
        </div>

        <div className="flex bg-surface p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'web'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code size={16} />
            Web (React/JS)
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'backend'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal size={16} />
            Backend (Python/Java/C++)
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 bg-background/50 overflow-hidden relative">
        <div className={activeTab === 'web' ? 'h-full w-full' : 'hidden'}>
          <WebRunner />
        </div>
        <div className={activeTab === 'backend' ? 'h-full w-full' : 'hidden'}>
          <BackendRunner />
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;
