"use client";

import { useState, useEffect } from "react";
import { X, CornerDownRight, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


// Define types for the API response based on the query
type Option = {
  id: string;
  content: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  content: string;
  options: Option[];
  hint: string;
  explanation: string;
};

type QuizData = {
  id: string;
  sessionId: string;
  questions: Question[];
  createdAt: string;
};

export const Quiz: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for modal visibility and content
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");

     const router = useRouter(); 
     const searchParams = useSearchParams();
  // Fetch quiz data when the component mounts
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if(!idFromQuery) {
      router.push('/')
    } 
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GenerateQuiz {
                generateQuiz(sessionId: "${idFromQuery ?? ''}") {
                  id
                  sessionId
                  questions {
                    id
                    content
                    options {
                      id
                      content
                      isCorrect
                    }
                    hint
                    explanation
                  }
                  createdAt
                }
              }
            `,
          }),
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        setQuizData(result.data.generateQuiz);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch quiz data");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [ router, searchParams]); // Fetch quiz data when topicId changes

  // Get the current question based on currentPage
  const currentQuestion = quizData?.questions[currentPage - 1];
  const totalPages = quizData?.questions.length || 5; // Fallback to 5 if no data

  // Map option IDs to A, B, C, D
  const optionLetters = ["A", "B", "C", "D"];
  const getOptionLetter = (index: number) => optionLetters[index] || String(index + 1);

  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    setShowFeedback(true);
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentPage(currentPage - 1);
    }
  };

  const getBorderColor = (optionId: string) => {
    if (!showFeedback) return "border-gray-700";
    const option = currentQuestion?.options.find((opt) => opt.id === optionId);
    if (option?.isCorrect) return "border-green-500";
    if (selectedOption === optionId) return "border-red-500";
    return "border-gray-700";
  };

  const selectedOptionObj = currentQuestion?.options.find(
    (opt) => opt.id === selectedOption
  );
  // Get the letter for the selected option
  const selectedOptionLetter =
    selectedOptionObj &&
    getOptionLetter(
      currentQuestion?.options.findIndex((opt) => opt.id === selectedOption) ?? -1
    );

  // Button handlers
  const handleHint = () => {
    setModalContent(currentQuestion?.hint || "No hint available.");
    setShowModal(true);
  };

  const handleWalkThrough = () => {
    setModalContent(currentQuestion?.explanation || "No explanation available.");
    setShowModal(true);
  };

  const handleKeepSimple = () => {
    // Simplify the explanation (e.g., take first sentence or shorten)
    const explanation = currentQuestion?.explanation || "No explanation available.";
    const simplified = explanation.split(". ")[0] + ".";
    setModalContent(simplified);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent("");
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="flex flex-col text-white animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>0</span>
          <span>5</span>
        </div>
        <div className="w-full bg-gray-800 h-1 rounded-full">
          <div className="bg-gray-600 h-1 rounded-full w-1/5"></div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="mb-3 p-4 border border-gray-700 rounded-lg"
          >
            <div className="flex items-start">
              <span className="mr-2">{getOptionLetter(index)}.</span>
              <div className="h-5 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-8 bg-gray-700 rounded-full w-24"
            ></div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-800 flex justify-between">
        <div className="h-10 bg-gray-700 rounded-md w-24"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-700 rounded-md w-24"></div>
        </div>
      </div>
    </div>
  );

  // Render loading or error states
  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!currentQuestion) {
    return <div className="text-white">No question available</div>;
  }

  return (
    <div className="flex flex-col text-white">
      {/* Modal for hints/explanations */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 max-w-md w-full">
            <p className="text-sm text-white mb-4">{modalContent}</p>
            <button
              onClick={closeModal}
              className="px-2 py-2 bg-gray-900 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>0</span>
          <span>{totalPages}</span>
        </div>
        <div className="w-full bg-gray-800 h-1 rounded-full">
          <div
            className="bg-white h-1 rounded-full"
            style={{
              width: `${((currentPage - 1) / (totalPages - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-4">
        <div className="flex items-start">
          <p className="text-sm text-white">{currentQuestion.content}</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 overflow-auto">
        {currentQuestion.options.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`mb-3 p-4 border rounded-lg cursor-pointer transition-colors ${getBorderColor(
              option.id
            )} ${selectedOption === option.id ? "bg-gray-800" : ""} ${
              showFeedback ? "pointer-events-none" : ""
            }`}
          >
            <div className="flex items-start">
              <span className="mr-2">{getOptionLetter(index)}.</span>
              <p className="text-sm">{option.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && selectedOption && selectedOptionObj && (
        <div className="px-4 py-4">
          <div
            className={`border rounded-md p-4 ${
              selectedOptionObj.isCorrect
                ? "bg-green-950/50 border-green-800"
                : "bg-red-950/50 border-red-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  selectedOptionObj.isCorrect ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {selectedOptionObj.isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <span
                className={
                  selectedOptionObj.isCorrect
                    ? "text-green-500 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {selectedOptionObj.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p
              className={
                selectedOptionObj.isCorrect
                  ? "text-green-300 text-sm"
                  : "text-red-300 text-sm"
              }
            >
              {selectedOptionObj.isCorrect
                ? `Option ${selectedOptionLetter}: "${selectedOptionObj.content}". This is correct! ${currentQuestion.explanation}`
                : `Option ${selectedOptionLetter}: "${selectedOptionObj.content}". This is incorrect. ${currentQuestion.explanation}`}
            </p>
            <div className="mt-2 text-xs text-gray-400">Question {currentPage}</div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleHint}
            className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2"
          >
            <CornerDownRight /> Give me a hint
          </button>
          <button
            onClick={handleWalkThrough}
            className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2"
          >
            <CornerDownRight /> Walk me through it
          </button>
          <button
            onClick={handleKeepSimple}
            className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2"
          >
            <CornerDownRight /> Keep it simple
          </button>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="px-4 py-3 border-t border-gray-800 flex justify-between">
        <button
          onClick={handlePrev}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? "bg-gray-800 text-gray-500"
              : "bg-gray-700 text-white"
          }`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="flex space-x-2">
          {selectedOption && (
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 bg-yellow-600 rounded-md text-sm font-medium hover:bg-yellow-500 transition-colors"
            >
              Try again
            </button>
          )}
          <button
            onClick={handleNext}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-800 text-gray-500"
                : "bg-gray-700 text-white"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};