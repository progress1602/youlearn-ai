"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronFirst, ChevronLast, } from "lucide-react";
import { Chat } from "../components/Features/Chat";
import { Summary } from "../components/Features/Summary";
import { Flashcards } from "./Features/FlashCards";
import { Quiz } from "../components/Features/Quiz";
import { Chapters } from "../components/Features/Chapters";
import { Transcripts } from "../components/Features/Transcript";
import FileViewer from './file_viewer';
// import { url } from "inspector";
// At the top of your component file
import { pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Chat");

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
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Head>
        <title>But what is a neural network?! | Deep learning chapter 1</title>
      </Head>

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
        {/* Header */}
        <header className="w-full bg-[#171717] p-4 flex items-center justify-between sticky top-0 z-10">
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
            <h1 className="text-xl font-bold">
              But what is a neural network?! | Deep learning chapter 1
            </h1>
          </div>
        </header>
      
        {/* Main Content */}
        <div className="flex-1 p-4 flex flex-col md:flex-row space-x-0 md:space-x-1">
        
          {/* Video Player Section */}
          {chatOpen && (
            <FileViewer url="https://res.cloudinary.com/dg5v4m8kc/video/upload/v1744824744/f3bsw1ejkbmdxplikspv.mp4" />
          )}

          {/* Right Sidebar (Desktop) */}
          <div
            className={`hidden md:flex ${chatOpen ? "w-[35rem]" : "flex-1"}`}
          >
            <div className="bg-[#121212] p-4 rounded-lg flex flex-col h-full transition-all duration-300 w-full">
              {/* Desktop Sidebar Header */}
              <div className="flex items-center mb-4">
                <button
                  className="text-gray-400 mr-2"
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  {chatOpen ? (
                    <ChevronLast className="h-6 w-6" />
                  ) : (
                    <ChevronFirst className="h-6 w-6" />
                  )}
                </button>
                <div
                  className={`flex bg-[#262626] h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full ${
                    chatOpen ? "space-x-1" : "space-x-20"
                  }`}
                >
                  {["Chat", "Summary", "Flashcards", "Quiz", "Chapters", "Transcripts"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                        activeTab === tab ? "bg-[#121212]" : ""
                      } ${tab === "Transcripts" ? "mr-1" : "ml-1"}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
                {activeTab === "Chat" && <Chat />}
                {activeTab === "Summary" && <Summary />}
                {activeTab === "Flashcards" && <Flashcards />}
                {activeTab === "Quiz" && <Quiz />}
                {activeTab === "Chapters" && <Chapters />}
                {activeTab === "Transcripts" && <Transcripts />}
              </div>
            </div>
          </div>
          {/* Mobile Content Area */}
          <div className="mt-4 flex-1 flex flex-col md:hidden">
            <div
              className={`flex bg-[#121212] h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                chatOpen ? "space-x-1" : "space-x-4"
              }`}
            >
              <button
                className="px-2 py-2 text-gray-400"
                onClick={() => setChatOpen(!chatOpen)}
              >
                {chatOpen ? (
                  <ChevronLast className="h-6 w-6" />
                ) : (
                  <ChevronFirst className="h-6 w-6" />
                )}
              </button>
              {["Chat", "Summary", "Flashcards", "Quiz", "Chapters", "Transcripts"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 shrink-0 ${
                      activeTab === tab ? "bg-black" : "bg-[#121212]"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span>{tab}</span>
                  </button>
                )
              )}
            </div>

            {/* Mobile Chat Content */}
            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              {activeTab === "Chat" && (
                <div className="flex-1 flex flex-col p-4 rounded-lg bg-[#121212]">
                  <div
                    className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      maxHeight: "calc(100vh - 300px)", 
                      display: "flex",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <Chat />
                  </div>
                </div>
              )}
              {activeTab === "Summary" && <Summary />}
              {activeTab === "Flashcards" && <Flashcards />}
              {activeTab === "Quiz" && <Quiz />}
              {activeTab === "Chapters" && <Chapters />}
              {activeTab === "Transcripts" && <Transcripts />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}