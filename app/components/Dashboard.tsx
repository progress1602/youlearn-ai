"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);

      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile !== isMobile) {
          setSidebarOpen(!mobile);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`flex-1 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        } transition-all duration-300 flex flex-col`}
      >
        <div className="w-full bg-[#121212] border-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {(!sidebarOpen || isMobile) && (
              <button
                className="text-gray-400"
                onClick={() => setSidebarOpen(true)}
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
            {!sidebarOpen && (
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
          <h1 className="text-4xl font-medium mb-12 text-center">
            What do you want to learn today?
          </h1>
          <div className="max-w-3xl mx-auto mb-16">
            <div className="border border-gray-700 rounded-md p-4 flex items-center">
              <span className="text-gray-400 flex-1">
                <input
                  type="text"
                  placeholder="Upload file, paste YouTube video, or record a lecture"
                  className="w-full bg-transparent outline-none"
                />
              </span>
              <div className="flex items-center gap-4">
                <button className="text-gray-400">
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
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button className="text-gray-400">
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
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button className="bg-gray-700 rounded-xl p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">Explore topics</h2>
            <Link href="/content">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-900 rounded-lg p-4 h-32 flex items-end"></div>
              <div className="bg-indigo-900 rounded-lg p-4 h-32 flex items-end"></div>
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-end"></div>
              <div className="bg-blue-900 rounded-lg p-4 h-32 flex items-end"></div>
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-end"></div>
              <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-end"></div>
            </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
