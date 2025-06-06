"use client";

import type React from "react";
import { useState } from "react";
import { X, CornerDownRight, Check, RefreshCcw } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

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

interface QuizProps {
  quizData: QuizData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ quizData, loading, error, refetch }) => {
  const { theme } = useAppContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");

  const currentQuestion = quizData?.questions[currentPage - 1];
  const totalPages = quizData?.questions.length || 5;

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
    if (!showFeedback) return theme === "dark" ? "border-gray-700" : "border-gray-300";
    const option = currentQuestion?.options.find((opt) => opt.id === optionId);
    if (option?.isCorrect) return "border-green-500";
    if (selectedOption === optionId) return "border-red-500";
    return theme === "dark" ? "border-gray-700" : "border-gray-300";
  };

  const selectedOptionObj = currentQuestion?.options.find((opt) => opt.id === selectedOption);
  const selectedOptionLetter =
    selectedOptionObj && getOptionLetter(currentQuestion?.options.findIndex((opt) => opt.id === selectedOption) ?? -1);

  const handleHint = () => {
    setModalContent(currentQuestion?.hint || "No hint available.");
    setShowModal(true);
  };

  const handleWalkThrough = () => {
    setModalContent(currentQuestion?.explanation || "No explanation available.");
    setShowModal(true);
  };

  const handleKeepSimple = () => {
    const explanation = currentQuestion?.explanation || "No explanation available.";
    const simplified = explanation.split(". ")[0] + ".";
    setModalContent(simplified);
    setShowModal(true);
  };

  const handleRefresh = () => {
    refetch();
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentPage(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent("");
  };

  const SkeletonLoader = () => (
    <div
      className={`flex flex-col animate-pulse ${theme === "dark" ? "text-white bg-[#121212]" : "text-black bg-white"}`}
    >
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>0</span>
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{totalPages}</span>
        </div>
        <div className={`w-full h-1 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
          <div className={`h-1 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-400"} w-1/5`}></div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className={`h-6 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-3/4`}></div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`mb-3 p-4 border rounded-lg ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
          >
            <div className="flex items-start">
              <span className="mr-2">{getOptionLetter(index)}.</span>
              <div className={`h-5 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-full`}></div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`px-4 py-3 border-t flex justify-between items-center ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex space-x-2">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`h-8 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-24`}
            ></div>
          ))}
        </div>
      </div>
      <div
        className={`px-4 py-3 border-t flex justify-between ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className={`h-10 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-24`}></div>
        <div className="flex space-x-2">
          <div className={`h-10 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-24`}></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className={theme === "dark" ? "text-red-400" : "text-red-600"}>Error: {error}</div>;
  }

  if (!currentQuestion) {
    return <div className={theme === "dark" ? "text-white" : "text-black"}>No question available</div>;
  }

  return (
    <div className={`flex flex-col ${theme === "dark" ? "text-white bg-[#121212]" : "text-black bg-white"}`}>
      {showModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${theme === "dark" ? "bg-opacity-50 bg-black" : "bg-opacity-30 bg-gray-500"}`}
        >
          <div className={`rounded-lg p-6 max-w-md w-full ${theme === "dark" ? "bg-black" : "bg-white"}`}>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>{modalContent}</p>
            <button
              onClick={closeModal}
              className={`px-2 py-2 rounded-md ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-200 text-black"}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>0</span>
          <div className="flex items-center gap-2">
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{totalPages}</span>
            <RefreshCcw
              className="h-4 w-4 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={handleRefresh}
            />
          </div>
        </div>
        <div className={`w-full h-1 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
          <div
            className="bg-blue-500 h-1 rounded-full"
            style={{
              width: `${((currentPage - 1) / (totalPages - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start">
          <p className="text-sm">{currentQuestion.content}</p>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-auto">
        {currentQuestion.options.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`mb-3 p-4 border rounded-lg cursor-pointer transition-colors ${getBorderColor(
              option.id,
            )} ${selectedOption === option.id ? (theme === "dark" ? "bg-gray-800" : "bg-gray-100") : ""} ${
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

      {showFeedback && selectedOption && selectedOptionObj && (
        <div className="px-4 py-4">
          <div
            className={`border rounded-md p-4 ${
              selectedOptionObj.isCorrect
                ? theme === "dark"
                  ? "bg-green-950/50 border-green-800"
                  : "bg-green-100 border-green-300"
                : theme === "dark"
                  ? "bg-red-950/50 border-red-800"
                  : "bg-red-100 border-red-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  selectedOptionObj.isCorrect ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {selectedOptionObj.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <span className={selectedOptionObj.isCorrect ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                {selectedOptionObj.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p
              className={
                selectedOptionObj.isCorrect
                  ? theme === "dark"
                    ? "text-green-300 text-sm"
                    : "text-green-600 text-sm"
                  : theme === "dark"
                    ? "text-red-300 text-sm"
                    : "text-red-600 text-sm"
              }
            >
              {selectedOptionObj.isCorrect
                ? `Option ${selectedOptionLetter}: "${selectedOptionObj.content}". This is correct! ${currentQuestion.explanation}`
                : `Option ${selectedOptionLetter}: "${selectedOptionObj.content}". This is incorrect. ${currentQuestion.explanation}`}
            </p>
            <div className={`mt-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Question {currentPage}
            </div>
          </div>
        </div>
      )}

      <div
        className={`px-4 py-3 border-t flex justify-between items-center ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex space-x-2">
          <button
            onClick={handleHint}
            className={`flex items-center text-xs md:gap-2 rounded-full px-3 py-2 border ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight /> Give me a hint
          </button>
          <button
            onClick={handleWalkThrough}
            className={`flex items-center text-xs md:gap-2 rounded-full px-3 py-2 border ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight /> Walk me through it
          </button>
          <button
            onClick={handleKeepSimple}
            className={`flex items-center text-xs md:gap-2 rounded-full px-3 py-2 border ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight /> Keep it simple
          </button>
        </div>
      </div>

      <div
        className={`px-4 py-3 border-t flex justify-between ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <button
          onClick={handlePrev}
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? theme === "dark"
                ? "bg-gray-800 text-gray-500"
                : "bg-gray-200 text-gray-400"
              : theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-300 text-black"
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
                ? theme === "dark"
                  ? "bg-gray-800 text-gray-500"
                  : "bg-gray-200 text-gray-400"
                : theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-300 text-black"
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