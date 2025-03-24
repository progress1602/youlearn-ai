"use client";

import Image from "next/image";
import { useAppContext } from "../../context/AppContext";
// interface SidebarProps {
//   sidebarOpen: boolean;
//   setSidebarOpen: (open: boolean) => void;
// }

export default function Sidebar() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  return (
    <div
      className={`${
        sideBarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 border-r border-gray-800 flex flex-col fixed h-screen bg-[#171717] z-20 w-64`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/cloudnotte-logo.png"
            alt="Logo"
            width={150}
            height={150}
            className=""
          />
        </div>
        <button className="text-gray-400" onClick={() => setSideBarOpen(false)}>
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="px-4 py-2">
        <button className="w-full border-2 border-dashed border-gray-600 h-10 rounded-xl py-2 px-4 text-left flex items-center gap-2">
          <span className="text-lg">+</span>
          <span>Add content</span>
        </button>
      </div>
      <div className="mt-8 px-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Welcome to YouLearn</h2>
        <p className="text-sm text-gray-400 mb-2">
          An AI tutor personalized to you.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Understand your files, YouTube video, or recorded lecture through key
          concepts, familiar learning tools like flashcards, and interactive
          conversations.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Were constantly improving the platform, and if you have any feedback,
          we would love to hear from you.
        </p>
      </div>
      <div className="mt-auto px-4 pb-4 mb-6">
        <p className="text-sm text-gray-400 mb-2 flex items-center justify-center">
          Sign in to continue.
        </p>
        <button className="w-full bg-white text-black rounded-xl text-sm py-2 font-medium">
          Sign in
        </button>
      </div>
    </div>
  );
}
