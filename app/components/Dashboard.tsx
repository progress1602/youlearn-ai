"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, ClipboardPaste, Mic } from "lucide-react"; 
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);

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
                width={150}
                height={150}
                className="hidden md:block"
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-700 rounded-md px-2 py-1">
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
            <button className="bg-white text-black rounded-md px-4 py-1">
              Sign in
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 mt-20">
          <h1 className="text-[30px] font-medium mb-6 text-center">
            What do you want to learn today?
          </h1>
          <div className="max-w-xl mx-auto mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-28">
              {/* Upload Button */}
              <button className="border border-gray-700 rounded-xl p-4  flex flex-col items-start justify-start text-white hover:bg-gray-800 transition">
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-gray-100 text-[16px]">Upload</span>
                <span className="text-sm text-gray-300 text-[14px]">PDF, PPT, DOC, TXT</span>
              </button>

              {/* Paste Button */}
              <button className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:bg-gray-800 transition">
                <ClipboardPaste className="h-6 w-6 mb-2" />
                <span className="text-gray-100 text-[16px]">Paste</span>
                <span className="text-sm text-gray-300 text-[14px]">YouTube, Website, Text</span>
              </button>

              {/* Record Button */}
              <button className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:bg-gray-800 transition">
                <Mic className="h-6 w-6 mb-2" />
                <span className="text-gray-100 text-[16px]">Record</span>
                <span className="text-sm text-gray-300 text-[14px]">Record Your Lecture</span>
              </button>
            </div>
          </div>

          {/* Updated Explore Topics Section */}
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Explore topics</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar">
              {/* Card 1: Introduction to Cell Biology */}
              <Link href="/content">
                <div className="flex-shrink-0 w-64 border border-gray-700 rounded-lg p-4 h-40 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-full h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Introduction to Biology"
                      width={256}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">Introduction to Biology</h3>
                    <p className="text-sm text-gray-300">Learn the basics of cells...</p>
                  </div>
                </div>
              </Link>

              {/* Card 2: The Map of Chemistry */}
              <Link href="/content">
                <div className="flex-shrink-0 w-64 border border-gray-700 rounded-lg p-4 h-40 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-full h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="The Map of Chemistry"
                      width={256}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">The Map of Chemistry</h3>
                    <p className="text-sm text-gray-300">Explore the branches...</p>
                  </div>
                </div>
              </Link>

              {/* Card 3: Cognitive Psychology */}
              <Link href="/content">
                <div className="flex-shrink-0 w-64 border border-gray-700 rounded-lg p-4 h-40 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-full h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Cognitive Psychology"
                      width={256}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">Cognitive Psychology</h3>
                    <p className="text-sm text-gray-300">An introduction...</p>
                  </div>
                </div>
              </Link>

              {/* Card 4: Another Topic */}
              <Link href="/content">
                <div className="flex-shrink-0 w-64 border border-gray-700 rounded-lg p-4 h-40 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-full h-20 border border-gray-600 rounded-lg">
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Another Topic"
                      width={256}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white">Another Topic</h3>
                    <p className="text-sm text-gray-300">Description...</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}