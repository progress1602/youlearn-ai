"use client";
import Navbar from './Navbar';
import Image from 'next/image';
import { useAppContext } from "@/context/AppContext";
import Link from 'next/link';

export default function YouLearnHomepage() {
  const { theme } = useAppContext();

  return (
    <div className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main content */}
      <div className="pt-16">
        <main className="mt-6 sm:mt-10 md:mt-16 lg:mt-20 xl:mt-24">
          <div className="flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Left side: Content */}
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium ${theme === 'dark' ? 'text-white' : 'text-[#121212]'} mb-4 sm:mb-6 md:mb-8`}>
                An AI tutor made for you
              </h1>
              <p className={`text-base sm:text-lg md:text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} max-w-2xl mx-auto md:mx-0 mb-6 sm:mb-8 md:mb-10 font-sans`}>
                Turn your learning materials into concise notes, quizzes, interactive chats, and more
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                <button className={`w-full sm:w-auto border ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'} px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base transition`}>
                  See features
                </button>
                <Link href="/auth">
            <div className="mt-4 px-3 pb-2">
              <button className="w-full bg-gradient-to-r from-[#0F4C81] via-[#5A3F59] to-[#C92A1F] text-white px-4 py-2 rounded-full font-medium">
                Get Started
              </button>
            </div>
           </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center">
                <div className="flex -space-x-2 sm:-space-x-3 mb-2 sm:mb-0">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 sm:border-4 ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-white'}`}>G</div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs border-2 sm:border-4 ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-white'}`}>E</div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs border-2 sm:border-4 ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-white'}`}>C</div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs border-2 sm:border-4 ${theme === 'dark' ? 'border-[#1a1a1a]' : 'border-white'}`}>A</div>
                </div>
                <span className={`sm:ml-3 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loved by over 1 million learners
                </span>
              </div>
            </div>
            
            {/* Right side: Image */}
            <div className="md:w-1/2">
              <div className="relative w-full max-w-md mx-auto md:max-w-full aspect-[3/2] min-h-[200px]">
                <Image
                  src="/cloudnotte ai.jpg"
                  alt="Cloudnotte AI Tutor"
                  fill
                  className="object-cover rounded-lg"
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 600px"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}