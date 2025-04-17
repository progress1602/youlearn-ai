"use client";

import { useUrl } from '@/context/AppContext';
import React, { useEffect, useState } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


const Transcripts: React.FC = () => {
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { sessionID, } = useUrl();
  useEffect(() => {
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
                getTranscripts(sessionId: "${sessionID ?? ''}") {
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
  }, [sessionID]);

  if (loading) {
    return (
      <div className="p-4 rounded-lg flex-1 ml-5">
        <div className="h-6 w-32 bg-gray-600 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-6 w-full bg-gray-600 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg flex-1 ml-5">
        <p className="text-lg font-bold">Transcripts</p>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg flex-1 ml-5">
      <p className="text-lg font-bold">Transcripts</p>
      {transcripts.length > 0 ? (
        transcripts.map((transcript, index) => (
          <p key={index} className="text-md mt-6">
            {transcript}
          </p>
        ))
      ) : (
        <p className="text-md mt-2">No transcripts available.</p>
      )}
    </div>
  );
};

export default Transcripts;