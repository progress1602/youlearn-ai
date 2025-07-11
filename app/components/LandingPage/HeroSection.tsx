"use client";

import Navbar from "./Navbar";
import Image from "next/image";
import { ArrowRight} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function YouLearnHomepage() {
  const { theme, toggleAuthModal, setTheme } = useAppContext();

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className={theme === "dark" ? "bg-[#1a1a1a]" : "bg-white"}>
      {/* Navigation Bar */}
      <Navbar />

      {/* Floating Theme Toggle */}
      <div className="fixed right-4 bottom-4 z-50">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <div className={`relative w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:transition-all ${
            theme === "dark" 
              ? "bg-gray-600 peer-checked:bg-red-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:bg-white after:border-gray-300 after:border after:rounded-full" 
              : "bg-gray-300 peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:bg-white after:border-gray-200 after:border after:rounded-full"
          }`}>
          </div>
        </label>
      </div>

      {/* Main content */}
      <div className="pt-16">
        <main className="mt-12 sm:mt-10 md:mt-16 lg:mt-20 xl:mt-10">
          <div className="flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Left side: Content */}
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${
                  theme === "dark" ? "text-white" : "text-[#121212]"
                } mb-4 sm:mb-6 md:mb-8`}
              >
                Turn Materials into Notes, Chats & Quiz
              </h1>
              <p
                className={`text-base sm:text-lg md:text-xl ${
                  theme === "dark" ? "text-gray-300" : "text-[#6D6D6D]"
                } max-w-2xl mx-auto md:mx-0 mb-6 sm:mb-8 md:mb-10 font-sans`}
              >
                Turn your learning materials into concise notes, quizzes, interactive chats, and more
              </p>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <button
                  className={`w-full sm:w-auto border ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                      : "border-gray-300 text-gray-800 hover:bg-gray-100"
                  } px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base transition`}
                >
                  How it works
                </button>
                <div className="mt-2 px-3 pb-2">
                  <button
                    onClick={toggleAuthModal}
                    className="w-40 items-center justify-center bg-[#99002b] text-white px-4 py-4 rounded-full flex"
                  >
                    Get Started <ArrowRight className="w-6 h-4 mt-1" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center">
                <div className="flex -space-x-4 sm:-space-x-3 mb-2 sm:mb-0">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-base border-2 sm:border-4 ${
                      theme === "dark" ? "border-[#1a1a1a]" : "border-white"
                    }`}
                  >
                    G
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center text-white text-base border-2 sm:border-4 ${
                      theme === "dark" ? "border-[#1a1a1a]" : "border-white"
                    }`}
                  >
                    E
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-base border-2 sm:border-4 ${
                      theme === "dark" ? "border-[#1a1a1a]" : "border-white"
                    }`}
                  >
                    C
                  </div>
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-500 flex items-center justify-center text-white text-base border-2 sm:border-4 ${
                      theme === "dark" ? "border-[#1a1a1a]" : "border-white"
                    }`}
                  >
                    A
                  </div>
                </div>
                <span
                  className={`sm:ml-3 text-lg sm:text-base ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loved by over 10k learners
                </span>
              </div>
            </div>

            {/* Right side: Image */}
            <div className="md:w-1/2 md:ml-20 lg:ml-20">
              <div className="relative w-full max-w-md mx-auto md:max-w-full min-h-[100px]">
                <Image
                  src="/hero-img.png"
                  alt="Cloudnotte AI Tutor"
                  width={500}
                  height={400}
                  className="object-contain rounded-lg"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}