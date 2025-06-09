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

  const totalPages = quizData?.questions?.length || 0;
  const currentQuestion = quizData?.questions?.[currentPage - 1];

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
    if (currentPage < totalPages) {
      setSelectedOption(null);
      setShowFeedback(false);
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
    if (!showFeedback || !currentQuestion) return theme === "dark" ? "border-gray-700" : "border-gray-300";
    const option = currentQuestion.options.find((opt) => opt.id === optionId);
    if (option?.isCorrect) return "border-green-500";
    if (selectedOption === optionId) return "border-red-500";
    return theme === "dark" ? "border-gray-700" : "border-gray-300";
  };

  const selectedOptionObj = currentQuestion?.options.find((opt) => opt.id === selectedOption);
  const selectedOptionLetter =
    selectedOptionObj && currentQuestion
      ? getOptionLetter(currentQuestion.options.findIndex((opt) => opt.id === selectedOption))
      : "";

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

  if (loading) {
    return (
      <div
        className={`flex flex-col animate-pulse p-4 ${theme === "dark" ? "text-white bg-[#121212]" : "text-black bg-white"}`}
      >
        <div className="mb-2">
          <div className="flex justify-between text-xs">
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Loading...</span>
          </div>
          <div className={`w-full h-1 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}></div>
        </div>
        <div className={`h-6 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-3/4 mb-4`}></div>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`mb-3 p-4 border rounded-lg ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
          >
            <div className={`h-5 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} w-full`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className={`p-4 ${theme === "dark" ? "text-white bg-[#121212]" : "text-black bg-white"}`}>
        <p className={theme === "dark" ? "text-red-400" : "text-red-600"}>
          {error || "No quiz questions available for this session."}
        </p>
        <button
          onClick={handleRefresh}
          className={`mt-2 px-4 py-2 rounded-md ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-300 text-black"}`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col p-4 ${theme === "dark" ? "text-white bg-[#121212]" : "text-black bg-white"}`}>
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

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Question {currentPage}</span>
          <div className="flex items-center gap-4">
            <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>of {totalPages}</span>
            <RefreshCcw
              className="h-4 w-4 cursor-pointer hover:text-gray-600"
              onClick={handleRefresh}
            />
          </div>
        </div>
        <div className={`w-full h-1 rounded-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
          <div
            className="bg-blue-500 h-1 rounded-full"
            style={{ width: totalPages > 0 ? `${(currentPage / totalPages) * 100}%` : "0%" }}
          ></div>
        </div>
      </div>

      <div className="py-2">
        <p className="text-sm">{currentQuestion ? currentQuestion.content : ""}</p>
      </div>

      <div className="flex-1 overflow-auto">
        {currentQuestion && currentQuestion.options.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`mb-3 p-4 border rounded-lg cursor-pointer ${getBorderColor(option.id)} ${
              selectedOption === option.id ? (theme === "dark" ? "bg-gray-800" : "bg-gray-100") : ""
            } ${showFeedback ? "pointer-events-none" : ""}`}
          >
            <div className="flex items-start">
              <span className="mr-2">{getOptionLetter(index)}.</span>
              <p className="text-sm">{option.content}</p>
            </div>
          </div>
        ))}
      </div>

      {showFeedback && selectedOption && selectedOptionObj && (
        <div className="py-4">
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
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedOptionObj.isCorrect ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {selectedOptionObj.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <span className={selectedOptionObj.isCorrect ? "text-green-500" : "text-red-500"}>
                {selectedOptionObj.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p className={`text-sm ${selectedOptionObj.isCorrect ? "text-green-600" : "text-red-600"}`}>
              Option {selectedOptionLetter}:{selectedOptionObj.content} {currentQuestion?.explanation}
            </p>
          </div>
        </div>
      )}

      <div
        className={`py-3 border-t flex justify-between items-center ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex space-x-2">
          <button
            onClick={handleHint}
            className={`flex items-center text-xs px-3 py-2 border rounded-full ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight className="w-4 h-4 mr-1" /> Hint
          </button>
          <button
            onClick={handleWalkThrough}
            className={`flex items-center text-xs px-3 py-2 border rounded-full ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight className="w-4 h-4 mr-1" /> Explain
          </button>
          <button
            onClick={handleKeepSimple}
            className={`flex items-center text-xs px-3 py-2 border rounded-full ${
              theme === "dark" ? "bg-[#111111] text-white border-gray-700" : "bg-white text-black border-gray-300"
            }`}
          >
            <CornerDownRight className="w-4 h-4 mr-1" /> Simplify
          </button>
        </div>
      </div>

      <div
        className={`py-3 border-t flex justify-between ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
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
              className="px-4 py-2 bg-yellow-600 rounded-md text-sm hover:bg-yellow-500"
            >
              Try Again
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