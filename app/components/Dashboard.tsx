"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Upload, ClipboardPaste, Mic, X, Link2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [textValue, setTextValue] = useState<string>("");
  const [submittedContent, setSubmittedContent] = useState<
    { type: string; value: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      setSideBarOpen(window.innerWidth >= 768);

      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile !== isMobile) {
          setSideBarOpen(!mobile);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile, setSideBarOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setInputValue("");
    setTextValue("");
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setSubmittedContent((prev) => [
        ...prev,
        { type: "URL", value: inputValue.trim() },
      ]);
    }
    if (textValue.trim()) {
      setSubmittedContent((prev) => [
        ...prev,
        { type: "Text", value: textValue.trim() },
      ]);
    }
    closeModal();
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const fileNames = fileArray.map((file) => file.name).join(", ");
      setSubmittedContent((prev) => [
        ...prev,
        { type: "File", value: fileNames },
      ]);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {sideBarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${
          sideBarOpen && !isMobile ? "ml-64" : "ml-0"
        } transition-all duration-300 flex flex-col`}
      >
        <div className="w-full bg-[#121212] border-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {(!sideBarOpen || isMobile) && (
              <button
                className="text-gray-400"
                onClick={() => setSideBarOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            {!sideBarOpen && (
              <Image
                src="/cloudnotte-logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="hidden sm:block"
              />
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center border border-gray-700 rounded-md px-2 py-1 text-sm">
              <span>US GB</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <button className="bg-white text-black rounded-md px-3 py-1 text-sm">
              Sign in
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto flex-1 mt-10 sm:mt-20">
          <h1 className="text-2xl sm:text-[30px] font-medium mb-6 text-center">
            What do you want to learn today?
          </h1>
          <div className="max-w-xl mx-auto mb-8 sm:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto sm:h-28">
              <div>
                <button
                  onClick={handleUploadClick}
                  className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:bg-gray-800 transition w-full h-full"
                >
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                  <span className="text-gray-100 text-sm sm:text-[16px]">
                    Upload
                  </span>
                  <span className="text-xs sm:text-sm text-gray-300">
                    PDF, PPT, DOC, PPTX
                  </span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,"
                  multiple
                  className="hidden"
                />
              </div>

              <button
                onClick={openModal}
                className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:bg-gray-800 transition w-full h-full"
              >
                <ClipboardPaste className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-gray-100 text-sm sm:text-[16px]">
                  Paste
                </span>
                <span className="text-xs sm:text-sm text-gray-300">
                  YouTube, Website, Text
                </span>
              </button>

              <button className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:bg-gray-800 transition w-full h-full">
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-gray-100 text-sm sm:text-[16px]">
                  Record
                </span>
                <span className="text-xs sm:text-sm text-gray-300">
                  Record Your Lecture
                </span>
              </button>
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-opacity-20 backdrop-blur-lg flex items-center justify-center z-50">
              <div className="bg-[#0A0A0A] rounded-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg h-auto sm:h-[31rem] text-white border border-gray-800">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 text-[#ECEDEE] text-sm sm:text-[16px] font-sans">
                    <Link2 className="h-4 w-4 mt-1" />YouTube, Website, etc.
                  </div>
                  <button onClick={closeModal}>
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="mb-4">
                  <h2 className="text-xs sm:text-sm font-serif text-gray-400">
                    Import YouTube links, website URLs, Docs, Arxiv, etc.
                  </h2>
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://youtube.be/dQw4w9WgXcQ"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 sm:p-4 mb-4 h-12 text-sm font-serif placeholder-gray-500 focus:outline-none"
                />
                <div className="flex items-center justify-center mb-4 space-x-2 sm:space-x-5">
                  <hr className="border-t border-gray-500 w-1/3 sm:w-48 mt-1" />
                  <span className="text-gray-400 text-sm">or</span>
                  <hr className="border-t border-gray-500 w-1/3 sm:w-48 mt-1" />
                </div>
                <div className="flex space-x-2">
                  <ClipboardPaste className="h-4 w-4 mt-1" />
                  <div className="text-sm sm:text-base">Paste text</div>
                </div>
                <div className="flex items-center mt-2 gap-2 mb-2">
                  <span className="text-xs sm:text-[15px] text-gray-400 font-serif">
                    Copy and paste text to add content
                  </span>
                </div>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Paste your notes here"
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl overflow-auto mt-2 p-3 h-24 sm:h-32 text-sm placeholder-gray-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={closeModal}
                    className="text-white text-xs sm:text-[13px] bg-[#262626] border border-gray-700 w-20 h-10 rounded-xl hover:bg-[#222224]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-white text-black text-xs sm:text-[14px] px-3 sm:px-4 py-1 rounded-xl hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {submittedContent.length > 0 && (
            <div className="max-w-xl mx-auto mb-8 sm:mb-16">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Your Content
              </h2>
              <div className="space-y-4">
                {submittedContent.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {item.type}
                    </h3>
                    {item.type === "URL" ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline break-all text-sm sm:text-base"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-300 break-words text-sm sm:text-base">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keep Learning Section */}
          <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Keep learning
              </h2>
              <Link href="/history">
                <h2 className="mb-4 text-sm sm:text-base">view all</h2>
              </Link>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Introduction to Biology"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Introduction to Biology
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Learn the basics of cells...
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="The Map of Chemistry"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      The Map of Chemistry
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Explore the branches...
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Explore Topics Section */}
          <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl mt-6 sm:mt-10">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Explore topics
              </h2>
              <Link href="/">
                <h2 className="mb-4 text-sm sm:text-base">close all</h2>
              </Link>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Introduction to Biology"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Introduction to Biology
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Learn the basics of cells...
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="The Map of Chemistry"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      The Map of Chemistry
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Explore the branches...
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Cognitive Psychology"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Cognitive Psychology
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      An introduction...
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/content">
                <div className="flex-shrink-0 w-52 sm:w-64 border border-gray-700 rounded-lg p-4 h-36 sm:h-40 flex flex-col justify-between relative overflow-hidden snap-center">
                  <div className="w-full h-16 sm:h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Another Topic"
                      width={208}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Another Topic
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Description...
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
      `}</style>
    </div>
  );
}