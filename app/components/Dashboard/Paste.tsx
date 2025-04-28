"use client";

import { useState } from "react";
import { ClipboardPaste, X, Link2 } from "lucide-react";
import { submitLinkMutation } from "@/app/api/graphql/querys/literals/url";

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""; // For submitLinkMutation
const NOTE_API_URL = "http://164.90.157.191:4884/graphql"; // For SubmitText

interface PasteInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string }[]>
  >;
}

export default function PasteInput({ setSubmittedContent }: PasteInputProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [textValue, setTextValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setInputValue("");
    setTextValue("");
  };

  const handleSubmit = async () => {
    let hasContent = false;
    setIsSubmitting(true);

    // Handle URL submission (existing logic)
    if (inputValue.trim()) {
      hasContent = true;
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submitLinkMutation(inputValue.trim()),
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Errors (URL):", result.errors);
          setIsSubmitting(false);
          return;
        }

        // Add URL to submitted content
        setSubmittedContent((prev) => [
          ...prev,
          { type: "URL", value: inputValue.trim() },
        ]);
      } catch (error) {
        console.error("URL Request Failed:", error);
        setIsSubmitting(false);
        return;
      }
    }

    // Handle text submission using SubmitText mutation
    if (textValue.trim()) {
      hasContent = true;
      try {
        const submitTextMutation = `
          mutation SubmitText($text: String!) {
            submitText(text: $text) {
              id
              url
              status
              fileType
              createdAt
              updatedAt
              title
            }
          }
        `;

        const variables = {
          text: textValue.trim(), // Dynamically use textValue from textarea
        };

        const response = await fetch(NOTE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submitTextMutation,
            variables,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Errors (Text):", result.errors);
          setIsSubmitting(false);
          return;
        }

        // Add text to submitted content
        setSubmittedContent((prev) => [
          ...prev,
          { type: "Text", value: textValue.trim() },
        ]);
      } catch (error) {
        console.error("Text Request Failed:", error);
        setIsSubmitting(false);
        return;
      }
    }

    // Close modal if content was submitted
    if (hasContent) {
      setIsSubmitting(false);
      closeModal();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:shadow-gray-500 transition-transform duration-300 hover:scale-105 w-full h-full relative overflow-hidden group"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <ClipboardPaste className="h-5 w-5 sm:h-6 sm:w-6 mb-2 relative z-10" />
        <span className="text-gray-100 text-sm sm:text-[16px] relative z-10">
          Paste
        </span>
        <span className="text-xs sm:text-sm text-gray-300 relative z-10">
          YouTube, Website, Text
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl p-6 w-full max-w-lg text-white border border-gray-800/50 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 text-[#ECEDEE] text-lg font-sans">
                <Link2 className="h-5 w-5 mt-1 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Import Content
                </span>
              </div>
              <button
                onClick={closeModal}
                className="hover:text-gray-300 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://youtube.be/dQw4w9WgXcQ"
              className="w-full bg-[#151515] border border-gray-700 rounded-xl p-4 mb-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
            />
            <div className="flex items-center justify-center my-4">
              <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="h-px w-1/3 bg-gradient-to-l from-transparent via-gray-500 to-transparent" />
            </div>
            <div className="flex gap-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent ml-2">
              <ClipboardPaste className="w-5 h-5 text-purple-400" />
              Paste
            </div>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Paste your notes here"
              className="w-full bg-[#151515] border border-gray-700 rounded-xl p-4 h-32 mt-2 text-md placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Add Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}