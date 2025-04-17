import React, { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useUrl } from '@/context/AppContext';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const Chat: React.FC = () => {
  // Initialize messages from localStorage or default welcome message
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages
      ? JSON.parse(savedMessages)
      : [
          {
            sender: 'AI',
            text: 'Welcome to the chat! Ask me anything. I may not always be right, but your feedback will help me improve!',
          },
        ];
  });
  const { sessionID, } = useUrl();
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const SESSION_ID = sessionID ?? '';

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user's message to the chat
    const userMessage = { sender: 'User', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare GraphQL query with sessionId as ID!
    const query = `
      query Chat($sessionId: ID!, $question: String!) {
        chat(sessionId: $sessionId, question: $question) {
          id
          sessionId
          question
          content
          createdAt
        }
      }
    `;

    try {
      // Send request to GraphQL API using Fetch
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            sessionId: SESSION_ID,
            question: input,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Extract the AI response from the GraphQL response
      const aiResponse = result.data.chat.content;

     
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: aiResponse },
      ]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
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
      <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.12s' }}></div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200 disabled:bg-gray-600"
            disabled={isLoading}
          >
            <SendHorizontal />
          </button>
        </div>
      </form>
    </div>
  );
};