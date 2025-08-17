import React from 'react';

const Bubble = ({ sender = 'athena', children }) => (
  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
    sender === 'athena' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-800 ml-auto'
  }`}>
    {children}
  </div>
);

const ChatTeaser = ({ onClose, onOpenSignUp }) => {
  const messages = [
    { sender: 'athena', text: "Hi! I'm Athena, your AI career advisor. How can I help with your career today?" },
    { sender: 'user', text: 'I want to transition into data science. Where should I start?' },
    { sender: 'athena', text: 'Great goal! Based on your background, I recommend solidifying Python, statistics, and SQL first. Then, build a project using Pandas and scikit-learn. Would you like a tailored roadmap?' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Chat with Athena (Preview)</h2>
            <p className="text-blue-100">See how the conversation looks. Sign up to save history.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 bg-gray-50">
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className="flex">
                <Bubble sender={m.sender}>{m.text}</Bubble>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-gray-200 p-3 flex items-center gap-3 opacity-60">
            <input className="flex-1 outline-none" placeholder="Type a message... (disabled in preview)" disabled />
            <button className="btn-primary opacity-70 cursor-not-allowed" disabled>Send</button>
          </div>

          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={onOpenSignUp}>Sign up (Coming soon)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTeaser;