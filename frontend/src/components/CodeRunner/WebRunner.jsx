import React, { useState } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";

const WebRunner = () => {
  const [template, setTemplate] = useState('react');

  return (
    <div className="h-full w-full flex flex-col bg-surface border border-white/10 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <div className="p-4 border-b border-white/10 bg-background/50 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white">Web Environment</h3>
          <p className="text-sm text-gray-400 mt-1">Changes are compiled and executed instantly in your browser.</p>
        </div>
        <select 
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="bg-background border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
        >
          <option value="react">React</option>
          <option value="vanilla">HTML/CSS/JS (Vanilla)</option>
        </select>
      </div>
      <div className="flex-1 p-4 overflow-hidden relative">
        <div className="absolute inset-4">
          <Sandpack
            template={template}
            theme="dark"
            options={{
              showNavigator: true,
              showLineNumbers: true,
              editorHeight: "calc(100vh - 300px)",
              wrapContent: true,
            }}
            customSetup={{
              dependencies: template === 'react' ? { "lucide-react": "^0.263.1" } : {}
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WebRunner;
