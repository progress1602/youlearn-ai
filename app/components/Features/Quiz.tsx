"use client";

import { useState } from "react";
import { X, CornerDownRight, Check } from "lucide-react";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export const Quiz: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const options: Option[] = [
    {
      id: "A",
      text: "It indicates the effectiveness of Beam-Beam Compensator Wires (BBCW) in mitigating the adverse effects of long-range beam-beam interactions.",
      isCorrect: true,
    },
    {
      id: "B",
      text: "It is a key observable that can be measured with high reliability and precision, corresponding to the equilibrium current in diffusion processes.",
      isCorrect: false,
    },
    {
      id: "C",
      text: "It represents the rate of emittance growth, which is a critical factor for evaluating collider performance.",
      isCorrect: false,
    },
    {
      id: "D",
      text: "It quantifies the magnetic field errors in the LHC, providing a detailed map of the error distribution.",
      isCorrect: false,
    },
  ];

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
    setCurrentPage(currentPage + 1);
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
    const option = options.find((opt) => opt.id === optionId);
    if (option?.isCorrect) return "border-green-500";
    if (selectedOption === optionId) return "border-red-500";
    return "border-gray-700";
  };

  const selectedOptionObj = options.find((opt) => opt.id === selectedOption);

  return (
    <div className="flex flex-col text-white">
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
          <p className="text-sm text-white">
            What is the significance of the equilibrium current Jeq (la)?
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 overflow-auto">
        {options.map((option) => (
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
              <span className="mr-2">{option.id}.</span>
              <p className="text-sm">{option.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && selectedOption && (
        <div className="px-4 py-4">
          <div
            className={`border rounded-md p-4 ${
              selectedOptionObj?.isCorrect
                ? "bg-green-950/50 border-green-800"
                : "bg-red-950/50 border-red-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  selectedOptionObj?.isCorrect ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {selectedOptionObj?.isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </div>
              <span
                className={
                  selectedOptionObj?.isCorrect
                    ? "text-green-500 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {selectedOptionObj?.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
            <p
              className={
                selectedOptionObj?.isCorrect
                  ? "text-green-300 text-sm"
                  : "text-red-300 text-sm"
              }
            >
              {selectedOptionObj?.isCorrect
                ? `Option ${selectedOption} : "${
                    selectedOptionObj?.text ?? ""
                  }". This is correct! The equilibrium current Jeq (la) indicates the effectiveness of Beam-Beam Compensator Wires (BBCW) in mitigating the adverse effects of long-range beam-beam interactions, making it a critical measure in collider performance.`
                  : `Option ${selectedOption} : "${
                      selectedOptionObj?.text ?? ""
                    }". This is incorrect. The equilibrium current Jeq (la) is a key observable that indicates the effectiveness of Beam-Beam Compensator Wires (BBCW) in mitigating the adverse effects of long-range beam-beam interactions, not ${
                      selectedOptionObj?.text.toLowerCase() ?? ""
                    }.`}
            </p>
            <div className="mt-2 text-xs text-gray-400">Question {currentPage}</div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2">
            <CornerDownRight /> Give me a hint
          </button>
          <button className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2">
            <CornerDownRight /> Walk me through it
          </button>
          <button className="flex items-center text-xs text-white md:gap-2 bg-[#111111] border border-gray-700 rounded-full px-3 py-2">
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
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};