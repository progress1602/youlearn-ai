
"use client";

import { useAppContext } from "@/context/AppContext";

export default function LearnSection() {
  const { theme, toggleAuthModal } = useAppContext();

  return (
    <div className="flex items-center justify-center mt-10 sm:mt-20 px-4">
      <div
        className={`rounded-4xl border p-6 sm:p-10 text-center w-full max-w-md sm:max-w-xl md:max-w-5xl lg:max-w-7xl h-auto sm:h-[350px] ${
          theme === "dark" ? "bg-[#2a2a2a] border-gray-700" : "bg-[#99002b] border-gray-200"
        }`}
      >
        <h1
          className={`text-3xl sm:text-3xl md:text-[40px] font-semibold font-sans mb-3 mt-6 sm:mt-10 ${
            theme === "dark" ? "text-white" : "text-white"
          }`}
        >
          Learn smarter, faster, easier.
        </h1>
        <p
          className={`text-md sm:text-lg font-serif ${
            theme === "dark" ? "text-gray-300" : "text-white"
          } mb-6 mt-5 sm:mt-7`}
        >
          Upload your content, and start your learning journey.
        </p>
        <div className="mt-4 px-3 pb-2">
          <button
            onClick={toggleAuthModal}
            className={`bg-white text-black text-sm sm:text-lg font-semibold h-12 sm:h-14 px-5 sm:px-6 py-2 rounded-full transition ${
              theme === "dark" ? "text-black" : "text-[#F6F6F6]"
            }`}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
