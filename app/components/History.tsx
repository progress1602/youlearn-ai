"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      {sideBarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${
          sideBarOpen && !isMobile ? "ml-72" : "ml-"
        } transition-all duration-300 flex flex-col`}
      >
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
        </header>
        <div className={`mt-16 ${!sideBarOpen ? "pl-5" : ""}`}>
            <div className="text-3xl">History</div>
            <hr className={`border-t border-gray-700  mt-5 ${!sideBarOpen ? "md:w-[79rem]" : "md:w-[65rem]"}`} />
        </div>
        <div className={`${!sideBarOpen ? "ml-10" : ""}`}>
        <div className="flex-shrink-0 w-96 border border-gray-700 rounded-lg p-4 h-64 mt-6">
            <div className="w-full h-44 border border-gray-600 rounded-lg">
             <Image
                src="/path-to-your-image.jpg"
                alt="Introduction to Biology"
                width={256}
                height={80}
                className="rounded-lg object-cover"
              />              
         </div>
         <div className="relative mt-2 z-10">
            <h3 className="text-lg font-semibold text-white">
             Introduction to Biology
            </h3>
            <p className="text-sm text-gray-300">
             Learn the basics of cells...
             </p>
         </div>
         </div>  
       </div>
       </div>
    </div>
  );
}

