import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const LANGUAGES = [
  { id: 'python', name: 'Python 3', version: '3.10.0', defaultCode: 'print("Hello from Python!")\n\nfor i in range(5):\n    print(f"Count: {i}")' },
  { id: 'java', name: 'Java', version: '15.0.2', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}' },
  { id: 'c', name: 'C', version: '10.2.0', defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}' },
  { id: 'cpp', name: 'C++', version: '10.2.0', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}' },
  { id: 'javascript', name: 'Node.js', version: '18.15.0', defaultCode: 'console.log("Hello from Node.js!");' },
];

const BackendRunner = () => {
  const [selectedLang, setSelectedLang] = useState(() => {
    const saved = localStorage.getItem('miniobserve_backend_lang');
    return saved ? JSON.parse(saved) : LANGUAGES[0];
  });
  const [code, setCode] = useState(() => {
    return localStorage.getItem('miniobserve_backend_code') || LANGUAGES[0].defaultCode;
  });
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem('miniobserve_backend_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('miniobserve_backend_lang', JSON.stringify(selectedLang));
  }, [selectedLang]);

  const handleLangChange = (e) => {
    const lang = LANGUAGES.find(l => l.id === e.target.value);
    setSelectedLang(lang);
    setCode(lang.defaultCode);
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Executing...');
    try {
      const res = await axios.post('http://localhost:8000/v1/code/execute', {
        language: selectedLang.id,
        version: selectedLang.version,
        code: code
      });
      
      if (res.data.run) {
        setOutput(res.data.run.output || 'No output.');
      } else {
        setOutput('Error: Invalid response from execution engine.');
      }
    } catch (err) {
      console.error(err);
      setOutput('Error: Execution failed. Ensure the backend is running and the proxy endpoint is configured.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(selectedLang.defaultCode);
    setOutput('');
  };

  return (
    <div className="h-full w-full flex flex-col bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <div className="p-4 border-b border-white/10 bg-background/50 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white">Backend Environment</h3>
          <p className="text-sm text-gray-400 mt-1">Code is sent to the Judge0 Engine for secure compilation and execution.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedLang.id}
            onChange={handleLangChange}
            className="bg-background border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button 
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            title="Reset to default code"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 relative">
          <Editor
            height="100%"
            language={selectedLang.id === 'cpp' || selectedLang.id === 'c' ? 'cpp' : selectedLang.id}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              padding: { top: 16 },
              automaticLayout: true,
              scrollBeyondLastLine: false
            }}
          />
        </div>
        
        <div className="w-full md:w-1/3 flex flex-col bg-[#1e1e1e]">
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-[#1e1e1e]">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <pre className={`font-mono text-sm whitespace-pre-wrap ${output.startsWith('Error:') ? 'text-red-400' : 'text-gray-300'}`}>
              {output || 'Output will appear here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendRunner;
