import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useProject } from '../context/ProjectContext';
import { usePlayground } from '../context/PlaygroundContext';
import { MessageSquare, Send, Bot, User, Loader2, Mic, MicOff, Paperclip, Volume2, VolumeX, FileText, X } from 'lucide-react';
import axios from 'axios';

const Playground = () => {
  const { projects, selectedProject, setSelectedProject, loading: projectsLoading } = useProject();
  
  const {
    messages, setMessages,
    input, setInput,
    isGenerating,
    autoSpeak, setAutoSpeak,
    pdfContext, setPdfContext,
    pdfFileName, setPdfFileName,
    selectedPrompt, setSelectedPrompt,
    selectedModel, setSelectedModel,
    prompts,
    handleSendMessage,
    removePdf
  } = usePlayground();
  // Voice States local to component
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8000/v1/parse-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPdfContext(res.data.document_id);
      setPdfFileName(file.name);
    } catch (err) {
      console.error("PDF upload failed", err);
      alert("Failed to parse PDF. Is the backend running?");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };



  if (projectsLoading) return <div className="p-8 text-center text-gray-400">Loading playground...</div>;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-background z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} className="text-primary" />
            Playground
          </h1>
          <p className="text-gray-400 text-sm mt-1">Chat directly with your AI. Traces are automatically logged.</p>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${autoSpeak ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-400 hover:text-white'}`}
            title="Toggle Text-to-Speech"
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="text-xs font-medium">Auto-Speak</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          <span className="text-sm text-gray-400">Model:</span>
          <select 
            className="input-field w-32 bg-surface border-white/10 py-1.5"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="llama3.2">Ollama (llama3.2)</option>
            <option value="gpt-4o">OpenAI (gpt-4o)</option>
            <option value="gpt-4o-mini">OpenAI (gpt-4o-mini)</option>
            <option value="claude-3-5-sonnet-20240620">Anthropic (Claude 3.5)</option>
            <option value="gemini-1.5-pro-latest">Gemini (1.5 Pro)</option>
            <option value="groq/llama3-70b-8192">Groq (Llama 3)</option>
          </select>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          <span className="text-sm text-gray-400">Prompt:</span>
          <select 
            className="input-field w-32 bg-surface border-white/10 py-1.5"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
          >
            <option value="">Default</option>
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          <span className="text-sm text-gray-400">Logging to:</span>
          <select 
            className="input-field w-32 bg-surface border-white/10 py-1.5"
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
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-panel p-12 text-center max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
            <p className="text-gray-400">Please create a project first to use the playground.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-emerald-400'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : msg.isError 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm font-mono text-sm'
                        : 'bg-surface border border-white/5 text-gray-200 rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-surface border border-white/5 rounded-tl-sm flex items-center">
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-background/80 backdrop-blur-md border-t border-white/5 shrink-0 flex flex-col items-center">
            <div className="max-w-4xl w-full">
              
              {/* PDF Attachment Indicator */}
              {pdfFileName && (
                <div className="mb-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg w-fit animate-fade-in">
                  <FileText size={14} />
                  <span className="text-xs font-medium truncate max-w-[200px]">{pdfFileName} attached</span>
                  <button onClick={removePdf} className="hover:text-white transition-colors p-0.5"><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="relative flex gap-2">
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  accept=".pdf" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />

                {/* Left Action Buttons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating || isUploading}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Attach PDF"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleListen}
                    disabled={isGenerating}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Voice Typing"
                  >
                    {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message or speak..."
                  className="w-full bg-surface border border-white/10 rounded-xl pl-24 pr-12 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
                  disabled={isGenerating || isListening}
                />
                
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Playground;
