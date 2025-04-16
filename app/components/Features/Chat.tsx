import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: 'AI',
      text: 'Welcome to the chat! Ask me anything. I may not always be right, but your feedback will help me improve!',
    },
  ]);
  const [input, setInput] = useState<string>('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: 'User', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: 'Cool question! Let me explain that for you...' },
      ]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col justify-end p-4 rounded-lg max-h-[calc(100vh-11rem)] mx-auto max-w-3xl">
      <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 flex flex-col-reverse">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 ${
                  msg.sender === 'User' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-200'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200"
        >
          <SendHorizontal />
        </button>
      </form>
    </div>
  );
};