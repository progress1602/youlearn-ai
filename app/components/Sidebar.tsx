"use client";

import Image from "next/image";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import {
 
  Moon,
  LogOut,
  ChevronLeft,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div
      className={`${
        sideBarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 border-r border-gray-800 flex flex-col fixed h-screen bg-[#171717] z-20 w-64`}
    >
      {/* Sidebar Header */}
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
        <button
          className="text-gray-400"
          onClick={() => setSideBarOpen(false)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Add Content Button */}
      <div className="px-4 py-2">
        <Link href="/">
        <button className="w-full border-2 border-dashed text-gray-400 border-gray-600 h-10 rounded-xl py-2 px-4 text-left flex items-center gap-2">
          <span className="text-lg">+</span>
          <span>Add content</span>
        </button>
        </Link>
      </div>

      {/* Welcome Section */}
      <div className="mt-8 px-4 overflow-y-auto">
        <h2 className="text-lg text-gray-400 font-semibold mb-2">
          Welcome to Cloudnotte Ai
        </h2>
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

      {/* Sign In Section with Dropdown */}
      <div className="mt-auto px-4 pb-4 mb-6">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-full bg-white text-black rounded-xl text-md py-2 font-bold"
          >
            David Henry
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-12 left-0 w-full bg-black border border-black rounded-lg shadow-lg">
              {/* User Profile in Dropdown */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-sm">DH</span> {/* Placeholder for user initials */}
                </div>
                <span className="text-gray-400">David Henry</span>
              </div>

              {/* Menu Items */}
              <ul className="py-2">
                <li className="px-4 py-2 text-gray-400 hover:bg-gray-900 flex items-center gap-2">
                  <UsersRound className="h-5 w-5" />
                  My profile
                </li>
                <li className="px-4 py-2 text-gray-400 hover:bg-gray-900 flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Dark Mode
                  <label className="inline-flex items-center cursor-pointer ml-auto">
                    <input type="checkbox" className="sr-only peer " />
                    <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
                  </label>
                </li>
                <li className="px-4 py-2 text-gray-400 hover:bg-gray-900 flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Log out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}