"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronFirst, ChevronLast, SendHorizontal } from "lucide-react";

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Chat");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "AI", text: "Welcome to the chat! Ask me anything. I may not always be right, but your feedback will help me improve!" },
  ]);
  const [input, setInput] = useState<string>("");

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: "User", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Cool question! Let me explain that for you..." },
      ]);
    }, 1000);
  };

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
            <div className="flex-1 bg-[#121212] p-4 rounded-lg flex flex-col transition-all duration-300">
              <div className="relative flex-1">
                <div className="bg-black h-full rounded-lg">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/aircAruvnKk?si=5q5u2o6xS5q5u2o6"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {/* Right Sidebar (Desktop) */}
          <div className={`hidden md:flex ${chatOpen ? 'w-[35rem]' : 'flex-1'}`}>
            <div 
              className="bg-[#121212] p-4 rounded-lg flex flex-col h-full transition-all duration-300 w-full"
            >
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
                  className={`flex bg-gray-700 h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full ${
                    chatOpen ? 'space-x-1' : 'space-x-20'
                  }`}
                >
                  <button
                    className={`px-4 py-2 rounded-lg mt-1 mb-1 ml-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Chat" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Chat")}
                  >
                    <span>Chat</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Summary" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Summary")}
                  >
                    <span>Summary</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Questions" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Questions")}
                  >
                    <span>Questions</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Quiz" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Quiz")}
                  >
                    <span>Quiz</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Chapters" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Chapters")}
                  >
                    <span>Chapters</span>
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl mt-1 mb-1 mr-1 flex items-center space-x-2 shrink-0 ${
                      activeTab === "Transcripts" ? "bg-black" : "bg-gray-700"
                    }`}
                    onClick={() => setActiveTab("Transcripts")}
                  >
                    <span>Transcripts</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
                {activeTab === "Chat" && (
                  <div className="flex-1 flex flex-col justify-end p-4 rounded-lg max-h-[calc(100vh-11rem)]">
                    <div className="overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 flex flex-col-reverse">
                      <div className="space-y-4">
                        {messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              msg.sender === "User" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 ${
                                msg.sender === "User"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-900 text-gray-200"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <form
                      onSubmit={handleSendMessage}
                      className="mt-4 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200"
                      >
                        <SendHorizontal />
                      </button>
                    </form>
                  </div>
                )}
                {activeTab === "Summary" && (
                  <div className="bg-gray-700 p-4 rounded-lg flex-1">
                    <p className="text-sm">Summary of the Video</p>
                    <p className="text-sm mt-2">
                      This video introduces the basics of neural networks...
                    </p>
                  </div>
                )}
                {activeTab === "Questions" && (
                  <div className="bg-gray-700 p-4 rounded-lg flex-1">
                    <p className="text-sm">Questions about Neural Networks</p>
                    <p className="text-sm mt-2">
                      1. What is a neural network? <br />
                      2. How does backpropagation work?
                    </p>
                  </div>
                )}
                {activeTab === "Quiz" && (
                  <div className="bg-gray-700 p-4 rounded-lg flex-1">
                    <p className="text-sm">Quiz on Neural Networks</p>
                    <p className="text-sm mt-2">
                      1. What is the purpose of a neural network? <br />
                      2. Name one activation function.
                    </p>
                  </div>
                )}
                {activeTab === "Chapters" && (
                  <div className="p-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <p className="text-sm font-bold">Chapters</p>
                    <div className="text-sm mt-2">
                      <p className="font-black text-[1.1rem]">13:39 - Acids, Bases, and pH</p>
                      <p className="mt-1">
                        The strength of an acid is determined by the concentration of hydronium ions it produces, which is measured using pH—a scale where lower values indicate acidity and higher values indicate basicity. The pH scale and the pOH scale, which measures hydroxide ions, always add up to 14. In reactions between strong acids and bases, they neutralize each other to form water and salt, involving oxidation-reduction processes where the oxidation states of elements change.
                      </p>
                      <p className="font-black text-[1.1rem] mt-6">16:08 - Quantum Mechanics and Electron Configuration</p>
                      <p className="mt-1">
                        Electrons within an atom are described by four quantum numbers (n, l, ml, and ms) that define their shells, subshells, and orbitals, providing a probabilistic model of their locations. The electron configuration follows a specific filling order known as the Aufbau principle, with each subshell accommodating a set number of electrons, influenced by their quantum numbers. This structure allows for determining valence electrons by focusing on the subshells beyond the nearest noble gas configuration.ConcurrentModificationException
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === "Transcripts" && (
                  <div className="bg-gray-700 p-4 rounded-lg flex-1">
                    <p className="text-sm">Transcripts</p>
                    <p className="text-sm mt-2">
                      [0:00] Welcome to this video on neural networks... <br />
                      [1:02] A neural network is a series of algorithms...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden mt-4 flex-1 flex flex-col">
            <div 
              className={`flex bg-[#121212] h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                chatOpen ? 'space-x-1' : 'space-x-4'
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
              <button
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 shrink-0 ${
                  activeTab === "Chat" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Chat")}
              >
                <span>Chat</span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 shrink-0 ${
                  activeTab === "Summary" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Summary")}
              >
                <span>Summary</span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 shrink-0 ${
                  activeTab === "Questions" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Questions")}
              >
                <span>Questions</span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 shrink-0 ${
                  activeTab === "Quiz" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Quiz")}
              >
                <span>Quiz</span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 shrink-0 ${
                  activeTab === "Chapters" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Chapters")}
              >
                <span>Chapters</span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 shrink-0 ${
                  activeTab === "Transcripts" ? "bg-black" : "bg-gray-700"
                }`}
                onClick={() => setActiveTab("Transcripts")}
              >
                <span>Transcripts</span>
              </button>
            </div>

            {/* Mobile Content Area */}
            <div className="mt-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
              {activeTab === "Chat" && (
                <div className="flex-1 flex flex-col justify-end bg-gray-700 p-4 rounded-lg">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "User" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg shadow-md transition-all duration-300 ${
                            msg.sender === "User"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-900 text-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleSendMessage}
                    className="mt-4 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200"
                    >
                      <SendHorizontal />
                    </button>
                  </form>
                </div>
              )}
              {activeTab === "Summary" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm">Summary of the Video</p>
                  <p className="text-sm mt-2">
                    This video introduces the basics of neural networks...
                  </p>
                </div>
              )}
              {activeTab === "Questions" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm">Questions about Neural Networks</p>
                  <p className="text-sm mt-2">
                    1. What is a neural network? <br />
                    2. How does backpropagation work?
                  </p>
                </div>
              )}
              {activeTab === "Quiz" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm">Quiz on Neural Networks</p>
                  <p className="text-sm mt-2">
                    1. What is the purpose of a neural network? <br />
                    2. Name one activation function.
                  </p>
                </div>
              )}
              {activeTab === "Chapters" && (
                <div className="p-4 flex-1 max-h-[200px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <p className="text-sm font-bold">Chapters</p>
                  <div className="text-sm mt-2 space-y-4">
                    <div>
                      <p className="font-black text-[1rem]">13:39 - Acids, Bases, and pH</p>
                      <p className="mt-1">
                        The strength of an acid is determined by the concentration of hydronium ions it produces, which is measured using pH—a scale where lower values indicate acidity and higher values indicate basicity. The pH scale and the pOH scale, which measures hydroxide ions, always add up to 14. In reactions between strong acids and bases, they neutralize each other to form water and salt, involving oxidation-reduction processes where the oxidation states of elements change.
                      </p>
                    </div>
                    <div>
                      <p className="font-black text-[1rem]">16:08 - Quantum Mechanics and Electron Configuration</p>
                      <p className="mt-1">
                        Electrons within an atom are described by four quantum numbers (n, l, ml, and ms) that define their shells, subshells, and orbitals, providing a probabilistic model of their locations. The electron configuration follows a specific filling order known as the Aufbau principle, with each subshell accommodating a set number of electrons, influenced by their quantum numbers. This structure allows for determining valence electrons by focusing on the subshells beyond the nearest noble gas configuration.ConcurrentModificationException
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "Transcripts" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm">Transcripts</p>
                  <p className="text-sm mt-2">
                    [0:00] Welcome to this video on neural networks... <br />
                    [1:02] A neural network is a series of algorithms...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}