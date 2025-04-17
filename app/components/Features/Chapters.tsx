import { useUrl } from '@/context/AppContext';
import React, { useState, useEffect } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Chapter {
  title: string;
  summary: string;
  startTime: string;
  pageNumber: number;
}

interface GraphQLResponse {
  data?: {
    getChapters?: Chapter[] | string;
  };
  errors?: { message: string }[];
}

const CACHE_KEY = 'cached_chapters';

export const Chapters: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionID, } = useUrl();
  const fetchChapters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetChapters($sessionId: ID!) {
              getChapters(sessionId: $sessionId) {
                title
                summary
                startTime
                pageNumber
              }
            }
          `,
          variables: {
            sessionId: sessionID ?? '',
          },
        }),
      });

      const result: GraphQLResponse = await response.json();
      console.log('Raw API Response:', result);

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to fetch chapters');
      }

      const chaptersData = result.data?.getChapters;

      if (Array.isArray(chaptersData)) {
        setChapters(chaptersData);
        localStorage.setItem(CACHE_KEY, JSON.stringify(chaptersData));
      } else if (typeof chaptersData === 'string') {
        try {
          const parsedChapters = JSON.parse(chaptersData);
          if (Array.isArray(parsedChapters)) {
            setChapters(parsedChapters);
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsedChapters));
          } else {
            throw new Error('Parsed chapters data is not an array');
          }
        } catch {
          throw new Error('Chapters data is a string but not valid JSON');
        }
      } else {
        throw new Error('No valid chapters returned from the API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Fetch error:', errorMessage);
      setError(errorMessage);
      if (!chapters.length) {
        setChapters(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  useEffect(() => {
    console.log('State:', { loading, error, chapters });
  }, [loading, error, chapters]);

  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border border-gray-800 animate-pulse"
        >
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mx-auto max-w-3xl">
      <p className="text-lg font-bold text-white">Chapters</p>
      <div className="text-sm mt-4">
        {loading && <SkeletonLoader />}
        {!loading && error && chapters.length === 0 && (
          <div className="text-center text-red-500 mb-4">
            <p>Failed to load chapters: {error}</p>
          </div>
        )}
        {!loading && chapters.length === 0 && !error && (
          <div className="text-center text-white">
            <p>No chapters available.</p>
          </div>
        )}
        {!loading && chapters.length > 0 && (
          chapters.map((chapter, index) => (
            <div
              key={index}
              className="hover:bg-gray-900 p-4 rounded-lg mt-2 transition-colors duration-200 border border-gray-800"
            >
              <p className="font-black text-[1.1rem] text-white">
                {chapter.startTime} - {chapter.title}
              </p>
              <p className="mt-1 text-white">{chapter.summary}</p>
              <p className="mt-1 text-white text-xs">
                Page {chapter.pageNumber}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};