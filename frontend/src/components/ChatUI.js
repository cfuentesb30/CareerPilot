import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Bubble = ({ sender = 'athena', children, streaming = false }) => (
  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
    sender === 'athena' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-800 ml-auto'
  }`}>
    {children}
    {streaming && (
      <div className="flex items-center mt-2 text-xs text-blue-600">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="ml-2">Athena is typing...</span>
      </div>
    )}
  </div>
);

const ChatUI = ({ onClose, onOpenSignUp }) => {
  const { isAuthed } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState(null);

  const listRef = useRef(null);

  const activeTitle = useMemo(() => convos.find(c => c.id === activeId)?.title || 'Chat with Athena', [convos, activeId]);

  const loadConvos = async () => {
    try {
      const data = await api.get('/api/chat/conversations');
      setConvos(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e?.message || 'Failed to load conversations', 'error');
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      // scroll to bottom
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 50);
    } catch (e) {
      showToast(e?.message || 'Failed to load messages', 'error');
    }
  };

  const createConversation = async (title = 'Chat with Athena') => {
    setCreating(true);
    try {
      await api.post('/api/chat/conversations?title=' + encodeURIComponent(title));
      showToast('Conversation created', 'success');
      await loadConvos();
    } catch (e) {
      showToast(e?.message || 'Failed to create conversation', 'error');
    } finally {
      setCreating(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.del(`/api/chat/conversations/${id}`);
      showToast('Conversation deleted', 'success');
      if (id === activeId) {
        setActiveId(null);
        setMessages([]);
      }
      await loadConvos();
    } catch (e) {
      showToast(e?.message || 'Failed to delete conversation', 'error');
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !activeId || isStreaming) return;
    
    setInput('');
    setIsStreaming(true);
    
    // Add user message optimistically
    const userMessage = { 
      id: 'temp_user_' + Date.now(), 
      message_type: 'user', 
      content 
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Scroll to bottom immediately
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 50);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/conversations/${activeId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let athenaMessageId = null;
      let athenaMessageContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'user_message_added':
                  // User message already added optimistically
                  break;
                  
                case 'athena_response_start':
                  athenaMessageId = data.message_id;
                  setCurrentStreamingMessageId(athenaMessageId);
                  // Add empty Athena message that will be updated
                  setMessages((prev) => [...prev, {
                    id: athenaMessageId,
                    message_type: 'athena',
                    content: '',
                    streaming: true
                  }]);
                  break;
                  
                case 'athena_response_chunk':
                  if (data.message_id === athenaMessageId) {
                    athenaMessageContent = data.content;
                    setMessages((prev) => prev.map(msg => 
                      msg.id === athenaMessageId 
                        ? { ...msg, content: data.content, streaming: !data.is_final }
                        : msg
                    ));
                    
                    // Auto-scroll as content updates
                    setTimeout(() => {
                      if (listRef.current) {
                        listRef.current.scrollTop = listRef.current.scrollHeight;
                      }
                    }, 10);
                  }
                  break;
                  
                case 'response_complete':
                  setCurrentStreamingMessageId(null);
                  if (data.error) {
                    showToast('AI temporarily unavailable', 'error');
                  } else {
                    showToast('Message sent', 'success');
                  }
                  break;
                  
                case 'error':
                  showToast(data.message || 'Streaming error occurred', 'error');
                  break;
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
      
    } catch (e) {
      showToast(e?.message || 'Failed to send message', 'error');
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsStreaming(false);
      setCurrentStreamingMessageId(null);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!isAuthed) return;
      setLoading(true);
      try {
        await loadConvos();
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, [isAuthed]);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
    }
  }, [activeId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[80vh] overflow-hidden shadow-2xl flex">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-6 h-6 object-contain"
              />
              <div className="font-semibold text-dark-blue">Conversations</div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✖</button>
          </div>
          {!isAuthed ? (
            <div className="p-4 text-sm text-gray-700">
              You are not authenticated. Please sign up or log in to chat with Athena.
              <div className="mt-3">
                <button className="btn-secondary w-full" onClick={onOpenSignUp}>Sign up</button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 flex gap-2">
                <button className="btn-primary flex-1" onClick={() => createConversation()} disabled={creating}>{creating ? 'Creating…' : 'New Chat'}</button>
              </div>
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="p-4 text-gray-500">Loading…</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {convos.length === 0 && <div className="text-sm text-gray-500 p-3">No conversations</div>}
                    {convos.map((c) => (
                      <div key={c.id} className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${activeId === c.id ? 'bg-soft-green/10 text-dark-blue' : 'hover:bg-gray-50'}`} onClick={() => setActiveId(c.id)}>
                        <div className="text-sm truncate mr-2">{c.title}</div>
                        <button className="text-xs text-red-600 hover:underline" onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-6 h-6 object-contain"
              />
              <div className="font-semibold text-dark-blue">{activeTitle}</div>
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <img 
                  src="/athena-logo.png" 
                  alt="Athena Logo" 
                  className="w-16 h-16 mx-auto mb-4 object-contain opacity-50"
                />
                <div className="text-gray-500 text-sm">Start a conversation to chat with Athena.</div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex">
                  <Bubble 
                    sender={m.message_type === 'athena' ? 'athena' : 'user'}
                    streaming={m.streaming || false}
                  >
                    {m.content || (m.streaming ? '' : '...')}
                  </Bubble>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-200 flex items-center gap-3">
            <input 
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none"
              placeholder={isAuthed ? 'Type your message…' : 'Please sign up or log in to chat'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isAuthed || !activeId}
            />
            <button className="btn-primary" onClick={sendMessage} disabled={!isAuthed || !activeId || !input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;