"use client";

import type React from "react";
import { RefreshCcw } from "lucide-react";

interface SummaryProps {
  error: string;
  content: string;
  loading: boolean;
  refetch: () => void; // Add refetch prop to the interface
}

const Summary: React.FC<SummaryProps> = ({ error, content, loading, refetch }) => {
  return (
    <div className="p-4 flex-1 overflow-y-auto mx-auto max-w-3xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold">Summary</p>
        <button onClick={refetch} aria-label="Refetch Summary">
          <RefreshCcw className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
        </button>
      </div>
      <div className="text-sm md:text-md mt-1">
        {loading ? (
          <div className="p-4 rounded-lg flex-1 ml-5">
            <div className="h-6 w-80 bg-gray-600 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-6 w-full bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="p-4 rounded-lg">
            <p className="mt-1">{content || "No content available"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;