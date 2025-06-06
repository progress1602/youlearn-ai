"use client";

import type React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface Flashcard {
  id: number;
  question: string;
}

interface FlashcardsProps {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  refetch: () => void; // Add refetch prop
}

export const Flashcards: React.FC<FlashcardsProps> = ({ flashcards, loading, error, refetch }) => {
  const { theme } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1));
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div
      className={`flex items-center border rounded-xl justify-center animate-pulse ${
        theme === "dark" ? "border-gray-700 bg-[#121212]" : "border-gray-300 bg-white"
      }`}
    >
      <div
        className={`relative w-full mt-3 max-w-3xl aspect-[16/9] ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        <div className="absolute inset-0 mb-10 flex items-center justify-center p-8">
          <div
            className={`w-4/5 h-44 mt-2 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center text-sm">
          <div
            className={`absolute left-4 w-8 h-8 mt-2 rounded-full ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-12 h-8 rounded ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`absolute right-4 w-8 h-8 rounded-full ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className={`text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
        Error: {error}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className={`text-center ${theme === "dark" ? "text-white" : "text-black"}`}>
        No flashcards available.
      </div>
    );
  }

  return (
    <div
      className={`flex items-center border rounded-xl justify-center ${
        theme === "dark" ? "border-gray-700 bg-[#121212]" : "border-gray-300 bg-white"
      }`}
    >
      <div
        className={`relative w-full max-w-3xl aspect-[16/9] ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        <button
          onClick={refetch}
          className={`absolute top-4 right-4 ${
            theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-700"
          }`}
          aria-label="Refetch Flashcards"
        >
          <RefreshCcw size={20} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p className="text-center text-lg md:text-xl">{flashcards[currentIndex].question}</p>
        </div>
        <div
          className={`absolute bottom-4 left-0 right-0 flex justify-center items-center text-sm ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          <button
            onClick={goToPrevious}
            className={`absolute left-4 hover:text-gray-300 focus:outline-none ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={24} />
          </button>
          <span>
            {currentIndex + 1} / {flashcards.length}
          </span>
          <button
            onClick={goToNext}
            className={`absolute right-4 hover:text-gray-300 focus:outline-none ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
            aria-label="Next flashcard"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};