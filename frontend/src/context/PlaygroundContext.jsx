import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useProject } from './ProjectContext';
import api from '../utils/api';

const PlaygroundContext = createContext(null);

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
};

export const PlaygroundProvider = ({ children }) => {
  const { selectedProject } = useProject();

  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('playground_messages');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: "Hello! I am connected to your local Ollama instance via MiniObserve. How can I help you today?" }];
  });
  
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => sessionStorage.getItem('playground_autoSpeak') === 'true');
  const [pdfContext, setPdfContext] = useState(() => sessionStorage.getItem('playground_pdfContext') || '');
  const [pdfFileName, setPdfFileName] = useState(() => sessionStorage.getItem('playground_pdfFileName') || '');
  const [selectedPrompt, setSelectedPrompt] = useState(() => sessionStorage.getItem('playground_selectedPrompt') || '');
  const [selectedModel, setSelectedModel] = useState(() => sessionStorage.getItem('playground_selectedModel') || 'llama3.2');
  
  const [prompts, setPrompts] = useState([]);

  useEffect(() => { sessionStorage.setItem('playground_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { sessionStorage.setItem('playground_autoSpeak', autoSpeak); }, [autoSpeak]);
  useEffect(() => { sessionStorage.setItem('playground_pdfContext', pdfContext); }, [pdfContext]);
  useEffect(() => { sessionStorage.setItem('playground_pdfFileName', pdfFileName); }, [pdfFileName]);
  useEffect(() => { sessionStorage.setItem('playground_selectedPrompt', selectedPrompt); }, [selectedPrompt]);
  useEffect(() => { sessionStorage.setItem('playground_selectedModel', selectedModel); }, [selectedModel]);

  useEffect(() => {
    if (selectedProject) {
      api.get(`/prompts/?project_id=${selectedProject.id}`)
        .then(res => setPrompts(res.data))
        .catch(err => console.error("Failed to fetch prompts for playground", err));
    }
  }, [selectedProject]);

  const handleSendMessage = async (e, customInput) => {
    if (e) e.preventDefault();
    const messageContent = customInput !== undefined ? customInput : input;
    if (!messageContent.trim() || !selectedProject || isGenerating) return;

    const userMessage = { role: 'user', content: messageContent.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);

    try {
      let apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      // Inject selected Prompt Template
      if (selectedPrompt) {
        const p = prompts.find(p => p.id === selectedPrompt);
        if (p && p.versions && p.versions.length > 0) {
          const template = p.versions[p.versions.length - 1].template;
          apiMessages = [{ role: 'system', content: template }, ...apiMessages];
        }
      }
      
      const payload = {
        model: selectedModel,
        messages: apiMessages
      };
      
      if (pdfContext) {
        payload.document_id = pdfContext;
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(
        `${baseUrl}/v1/chat/completions`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${selectedProject.api_key}`
          }
        }
      );

      const aiContent = res.data.choices?.[0]?.message?.content || 'No response';
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      
      // Text-to-Speech
      if (autoSpeak && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiContent);
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (err) {
      console.error("Chat generation failed", err);
      let errorMsg = "Sorry, I encountered an error connecting to the AI.";
      if (err.response?.data?.detail) {
        errorMsg += ` Details: ${err.response.data.detail}`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const removePdf = () => {
    setPdfContext('');
    setPdfFileName('');
  };

  const value = {
    messages, setMessages,
    input, setInput,
    isGenerating,
    autoSpeak, setAutoSpeak,
    pdfContext, setPdfContext,
    pdfFileName, setPdfFileName,
    selectedPrompt, setSelectedPrompt,
    selectedModel, setSelectedModel,
    prompts, setPrompts,
    handleSendMessage,
    removePdf
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};
