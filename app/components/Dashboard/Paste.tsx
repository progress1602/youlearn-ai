"use client";

import { useState } from "react";
import { ClipboardPaste, X, } from "lucide-react";
import { submitLinkMutation } from "@/app/api/graphql/querys/literals/url";
import { useAppContext } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface PasteInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string }[]>
  >;
     setNewSession: ({session}:{session:Session} ) => void;
}

export default function PasteInput({ setSubmittedContent, setNewSession }: PasteInputProps) {
  const { theme } = useAppContext();
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

    // Retrieve username from local storage
    const username = localStorage.getItem("username") || "defaultUser";

    // Handle URL submission
    if (inputValue.trim()) {
      hasContent = true;
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submitLinkMutation(inputValue.trim(), username),
            variables: {
              url: inputValue.trim(),
              username: username,
            },
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
          mutation SubmitText($text: String!, $username: String!) {
            submitText(text: $text, username: $username) {
              id
              username
              status
              fileType
              createdAt
              updatedAt
              title
            }
          }
        `;

        const variables = {
          text: textValue.trim(),
          username: username,
        };

        const response = await fetch(API_URL, {
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
const mutationData = result.data?.submitText;
        // Add text to submitted content
        // setSubmittedContent((prev) => [
        //   ...prev,
        //   { type: "Text", value: textValue.trim() },
        // ]);
        setNewSession({
          session:{
            id: mutationData.id,
            url: mutationData.url,
            username: username,
            title: mutationData.title || "",
            createdAt: new Date().toISOString(),
            fileType: mutationData.fileType,
            isPending: false,
          },
        });
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
        className={`border rounded-xl p-4 flex flex-col items-start justify-start transition-transform duration-300 hover:scale-105 w-full h-full relative overflow-hidden group ${
          theme === 'dark'
            ? 'border-gray-700 text-white hover:shadow-gray-500'
            : 'border-gray-300 text-black hover:shadow-gray-300'
        }`}
      >
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
          }`}
        />
        <ClipboardPaste
          className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 relative z-10 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        />
        <span
          className={`text-sm sm:text-[16px] relative z-10 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Paste
        </span>
        <span
          className={`text-xs sm:text-sm relative z-10 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Upload Text
        </span>
      </button>

      {isModalOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 animate-fadeIn ${
            theme === 'dark' ? 'bg-black/50 backdrop-blur-sm' : 'bg-gray-500/30 backdrop-blur-sm'
          }`}
        >
          <div
            className={`rounded-2xl p-6 w-full max-w-lg border shadow-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border-gray-800/50 text-white'
                : 'bg-gradient-to-br from-white to-gray-100 border-gray-300 text-black'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              {/* <div className="flex gap-2 text-lg font-sans">
                <Link2
                  className={`h-5 w-5 mt-1 ${
                    theme === 'dark' ? 'text-[#99002b]' : 'text-[#99002b]'
                  }`}
                />
                <span
                  className={`bg-black bg-clip-text text-transparent`}
                >
                  Import Content
                </span>
              </div> */}
              <button
                onClick={closeModal}
                className={`hover:text-gray-300 transition ml-80 md:ml-[28rem] ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://youtube.be/dQw4w9WgXcQ"
              className={`w-full rounded-xl p-4 mb-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition ${
                theme === 'dark'
                  ? 'bg-[#151515] border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            />
            <div className="flex items-center justify-center my-4">
              <div
                className={`h-px w-1/3 bg-gradient-to-r from-transparent via-gray-500 to-transparent`}
              />
              <span
                className={`mx-4 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                OR
              </span>
              <div
                className={`h-px w-1/3 bg-gradient-to-l from-transparent via-gray-500 to-transparent`}
              />
            </div> */}
            <div
              className={`flex gap-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent ml-2`}
            >
              <ClipboardPaste
                className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-[#99002b]' : 'text-[#99002b]'
                }`}
              />
              Paste
            </div>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Paste your notes here"
              className={`w-full rounded-xl p-4 h-32 mt-2 text-md placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition resize-none ${
                theme === 'dark'
                  ? 'bg-[#151515] border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  isSubmitting
                    ? theme === 'dark'
                      ? 'bg-gray-600 cursor-not-allowed text-white'
                      : 'bg-gray-400 cursor-not-allowed text-black'
                    : theme === 'dark'
                    ? 'bg-[#99002b] text-white'
                    : 'bg-[#99002b] text-white'
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