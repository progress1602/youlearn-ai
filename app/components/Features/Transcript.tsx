"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const Transcripts: React.FC = () => {
  const { theme } = useAppContext();
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (!idFromQuery) {
      router.push('/app');
      return;
    }
    const fetchTranscripts = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetTranscripts {
                getTranscripts(sessionId: "${idFromQuery ?? ''}") {
                  content
                }
              }
            `,
          }),
        });

        const { data, errors } = await response.json();

        if (errors) {
          throw new Error(errors[0]?.message || 'Failed to fetch transcripts');
        }

        // Log the response for debugging
        console.log('API Response:', data);

        // Check if data.getTranscripts exists and is an array
        if (!data?.getTranscripts) {
          throw new Error('No transcripts found for the given session ID');
        }

        // Extract content from each transcript object
        const transcriptContents = data.getTranscripts.map(
          (transcript: { content: string }) => transcript.content
        );
        setTranscripts(transcriptContents);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching transcripts:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div
        className={`p-4 rounded-lg flex-1 ml-5 ${
          theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
        }`}
      >
        <div
          className={`h-6 w-32 rounded animate-pulse ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          } mb-4`}
        ></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className={`h-6 w-full rounded animate-pulse ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg flex-1 ml-5 ${
          theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
        }`}
      >
        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Transcripts
        </p>
        <p className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg flex-1 ml-5 ${
        theme === 'dark' ? 'bg-[#121212]' : 'bg-white'
      }`}
    >
      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Transcripts
      </p>
      {transcripts.length > 0 ? (
        transcripts.map((transcript, index) => (
          <p
            key={index}
            className={`text-md mt-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          >
            {transcript}
          </p>
        ))
      ) : (
        <p className={`text-md mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          No transcripts available.
        </p>
      )}
    </div>
  );
};

export default Transcripts;