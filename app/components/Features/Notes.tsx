"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSearchParams } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


type Note = {
  id: number;
  content: string;
};

export default function Notes() {
  const { theme } = useAppContext();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id'); // Using 'id' to match Summary component
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log sessionId, query parameters, and screen size
  useEffect(() => {
    console.log('sessionId:', sessionId);
    console.log('All query params:', Object.fromEntries(searchParams));
    console.log('Window width:', window.innerWidth); // Log screen width for debugging
  }, [sessionId, searchParams]);

  const addNote = async () => {
    if (newNote.trim() === '') return;
    if (!sessionId) {
      setError('Session ID is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending sessionId:', sessionId); // Debug
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AddNoteToSession($sessionId: ID!, $note: String!) {
              addNoteToSession(sessionId: $sessionId, note: $note) {
                id
                sessionId
                content
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            sessionId: sessionId,
            note: newNote,
          },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0]?.message || 'Failed to add note');
      }

      if (data?.addNoteToSession) {
        setNotes([...notes, { id: Date.now(), content: newNote }]);
        // Do not clear newNote, keep it in the textarea
      } else {
        throw new Error('No data returned from query');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log keydown event
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log('Key pressed:', e.key, 'Shift:', e.shiftKey); // Debug
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <div
      className={`p-8 w-full max-w-3xl mx-auto ${
        theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
      }`}
    >
      <h1
        className={`text-xl font-bold text-start mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-black'
        }`}
      >
        Notes
      </h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {loading && <p className="text-blue-500 mb-4">Adding note...</p>}
      {!sessionId && !error && (
        <p className="text-red-500 mb-4">Error: Session ID is required</p>
      )}
      <div className="mb-8">
        <textarea
          className={`w-full p-4 min-h-[24rem] sm:min-h-[24rem] md:min-h-[24rem] lg:min-h-[24rem] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-sm sm:text-sm md:text-base lg:text-base ${
            theme === 'dark'
              ? 'bg-gray-800 text-white border-gray-700'
              : 'bg-white text-black border-gray-300'
          }`}
          rows={4}
          placeholder="Write a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* Display saved notes */}
      {/* {notes.length > 0 && (
        <div className="mt-4">
          <h2
            className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`}
          >
            Saved Notes
          </h2>
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className={`p-4 rounded-lg text-sm sm:text-sm md:text-base lg:text-base ${
                  theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
                }`}
              >
                {note.content}
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
}