import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Bubble = ({ sender = 'athena', children }) => (
  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
    sender === 'athena' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-800 ml-auto'
  }`}>
    {children}
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
    if (!content || !activeId) return;
    setInput('');
    try {
      const payload = { content };
      const res = await api.post(`/api/chat/conversations/${activeId}/messages`, payload);
      // optimistic: append user message and Athena response
      setMessages((prev) => [
        ...prev,
        { id: 'temp_user_' + Date.now(), message_type: 'user', content },
        { id: res?.athena_message_id || ('temp_athena_' + Date.now()), message_type: 'athena', content: res?.athena_response || '...' }
      ]);
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 50);
      showToast('Message sent', 'success');
    } catch (e) {
      showToast(e?.message || 'Failed to send message', 'error');
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
                  <Bubble sender={m.message_type === 'athena' ? 'athena' : 'user'}>{m.content}</Bubble>
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