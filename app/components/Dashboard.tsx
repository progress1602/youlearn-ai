"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import UploadInput from "../components/Dashboard/Upload";
import PasteInput from "../components/Dashboard/Paste";
import RecordInput from "../components/Dashboard/Record";
import KeepLearning from "../components/Dashboard/KeepLearning";
import ExploreTopics from "../components/Dashboard/ExploreTopics";

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [submittedContent, setSubmittedContent] = useState<
    { type: string; value: string }[]
  >([]);

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
                className="hidden sm:block object-contain"
              />
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto flex-1 mt-10 sm:mt-20">
          <h1 className="text-2xl sm:text-[30px] font-medium mb-6 text-center">
            What do you want to learn today?
          </h1>
          <div className="max-w-xl mx-auto mb-8 sm:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto sm:h-28">
              <UploadInput setSubmittedContent={setSubmittedContent} />
              <PasteInput setSubmittedContent={setSubmittedContent} />
              <RecordInput setSubmittedContent={setSubmittedContent} />
            </div>
          </div>

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
          <KeepLearning />

          {/* Explore Topics Section */}
          <ExploreTopics />
        </div>
      </div>
    </div>
  );
}