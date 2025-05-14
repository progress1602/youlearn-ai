'use client';

import React, { useState, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ChatProps {
  sessionId?: string; // Optional sessionId prop
}

export const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const { theme } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id') || sessionId; // Fallback to prop if query param is missing

  // Initialize messages with default welcome message
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: 'AI',
      text: 'Welcome to the chat! Ask me anything. I may not always be right, but your feedback will help me improve!',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch session chat history
  useEffect(() => {
    if (!idFromQuery) return;

    const fetchSession = async () => {
      const query = `
        query GetSession($id: ID!) {
          getSession(id: $id) {
            id
            chats {
              id
              question
              content
              createdAt
            }
          }
        }
      `;

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { id: idFromQuery },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error('Error fetching session:', result.errors);
          return;
        }

        const chats = result.data?.getSession?.chats || [];
        const sessionMessages = chats
          .map((chat: { id: string; question: string; content: string; createdAt: string }) => [
            { sender: 'User', text: chat.question },
            { sender: 'AI', text: chat.content },
          ])
          .flat();

        setMessages((prev) => [...prev, ...sessionMessages]);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, [idFromQuery]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !idFromQuery) {
      if (!idFromQuery) router.push('/app');
      return;
    }

    // Add user's message to the chat
    const userMessage = { sender: 'User', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Prepare GraphQL query for sending message
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            sessionId: idFromQuery,
            question: input,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const aiResponse = result.data.chat.content;
      setMessages((prev) => [...prev, { sender: 'AI', text: aiResponse }]);
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
    <div
      className={`flex-1 flex flex-col justify-end p-4 rounded-lg max-h-[calc(100vh-11rem)] mx-auto max-w-3xl ${
        theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
      }`}
    >
      <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 flex flex-col-reverse">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 ${
                  msg.sender === 'User'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-900 text-gray-200'
                    : 'bg-gray-200 text-gray-800'
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
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ animationDelay: '0s' }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ animationDelay: '0.4s' }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ animationDelay: '0.8s' }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ animationDelay: '0.12s' }}
              ></div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className={`w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white border-gray-600'
                : 'bg-white text-black border-gray-300'
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-3 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600'
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400'
            }`}
            disabled={isLoading}
          >
            <SendHorizontal />
          </button>
        </div>
      </form>
    </div>
  );
};