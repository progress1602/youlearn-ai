"use client";

import Image from "next/image";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";
import {
  Moon,
  LogOut,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { sideBarOpen, setSideBarOpen, theme, setTheme } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("David Henry");
  const [initials, setInitials] = useState("DH");
  const router = useRouter();

  // Get username from localStorage and set initials
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUserName(storedName);
      const nameParts = storedName.trim().split(" ");
      if (nameParts.length >= 1) {
        const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
        const lastInitial = nameParts[nameParts.length - 1]?.charAt(0).toUpperCase() || "";
        setInitials(`${firstInitial}${lastInitial}`);
      }
    }
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <div
      className={`${
        sideBarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 border-r border-gray-800 flex flex-col fixed h-screen z-20 w-64 ${theme === "dark" ? "bg-[#171717]" : "bg-white"}`}
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
          className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          onClick={() => setSideBarOpen(false)}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Add Content Button */}
      <div className="px-4 py-2">
        <Link href="/app">
          <button className={`w-full border-2 border-dashed h-10 rounded-xl py-2 px-4 text-left flex items-center gap-2 ${theme === "dark" ? "text-gray-400 border-gray-600" : "text-gray-600 border-gray-300"}`}>
            <span className="text-lg">+</span>
            <span>Add content</span>
          </button>
        </Link>
      </div>

      {/* Welcome Section */}
      <div className="mt-8 px-4 overflow-y-auto">
        <h2 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
          Welcome to Cloudnotte Ai
        </h2>
        <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          An AI tutor personalized to you.
        </p>
        <p className={`text-sm mb-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Understand your files, YouTube video, or recorded lecture through key
          concepts, familiar learning tools like flashcards, and interactive
          conversations.
        </p>
        <p className={`text-sm mb-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Were constantly improving the platform, and if you have any feedback,
          we would love to hear from you.
        </p>
      </div>

      {/* Sign In Section with Dropdown */}
      <div className="mt-auto px-4 pb-4 mb-6">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className={`w-full rounded-xl text-md py-2 font-bold flex items-center justify-between px-4 ${theme === "dark" ? "bg-white text-black" : "bg-gray-200 text-gray-900"}`}
          >
            <span className="items-center justify-center">{userName}</span>
            <ChevronDown className="h-5 w-5" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className={`absolute bottom-12 left-0 w-full rounded-lg shadow-lg ${theme === "dark" ? "bg-black border border-gray-800" : "bg-white border border-gray-200"}`}>
              {/* User Profile in Dropdown */}
              <div className={`px-4 py-3 flex items-center gap-3 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}>
                  <span className={theme === "dark" ? "text-white" : "text-gray-900"}>{initials}</span>
                </div>
                <span className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>{userName}</span>
              </div>

              {/* Menu Items */}
              <ul className="py-2">
                <li className={`px-4 py-2 hover:bg-opacity-10 flex items-center gap-2 ${theme === "dark" ? "text-gray-400 hover:bg-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Moon className="h-5 w-5" />
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  <label className="inline-flex items-center cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={theme === "dark"}
                      onChange={toggleTheme}
                    />
                    <div className={`relative w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:transition-all ${theme === "dark" ? "bg-gray-600 peer-checked:bg-red-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:bg-white after:border-gray-300 after:border after:rounded-full" : "bg-gray-300 peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:bg-white after:border-gray-200 after:border after:rounded-full"}`}></div>
                  </label>
                </li>
                <li
                  className={`px-4 py-2 hover:bg-opacity-10 flex items-center gap-2 cursor-pointer ${theme === "dark" ? "text-gray-400 hover:bg-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
                  onClick={handleLogout}
                >
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