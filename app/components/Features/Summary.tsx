
import { useUrl } from '@/context/AppContext';
import React, { useEffect, useState } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


const Summary: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sessionID, } = useUrl();
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetSummary($sessionId: ID!) {
                getSummary(sessionId: $sessionId) {
                  content
                }
              }
            `,
            variables: { sessionId: sessionID ?? '' },
          }),
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        setContent(result.data.getSummary.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sessionID]);

  return (
    <div className="p-4 flex-1 overflow-y-auto mx-auto max-w-3xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <p className="text-lg font-bold">Summary</p>
      <div className="text-sm md:text-md mt-1">
        {loading ? (
           <div className="p-4 rounded-lg flex-1 ml-5">
           <div className="h-6 w-32 bg-gray-600 rounded animate-pulse mb-4"></div>
           <div className="space-y-4">
             {[...Array(8)].map((_, index) => (
               <div key={index} className="h-6 w-full bg-gray-600 rounded animate-pulse"></div>
             ))}
           </div>
         </div>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className=" p-4 rounded-lg">
            <p className="mt-1">{content || 'No content available'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;