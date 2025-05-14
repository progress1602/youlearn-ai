"use client";

import { useAppContext } from "@/context/AppContext";

export default function Footer() {
  const { theme } = useAppContext();

  return (
    <footer className={`py-4 px-6 border-t mt-16 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div className={`mb-4 md:mb-0 text-[16px] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          <p>© Copyright 2025 Cloudnotte Ai Inc.</p>
        </div>
        
        <nav className="flex flex-wrap gap-4 text-[17px] md:gap-6 justify-center">
          <a href="/blogs" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Blogs
          </a>
          <a href="/invite" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Invite & Earn
          </a>
          <a href="/careers" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Careers
          </a>
          <a href="/terms" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Terms & Conditions
          </a>
          <a href="/privacy" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Privacy Policy
          </a>
          <a href="/contact" className={`transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Contact Us
          </a>
        </nav>
      </div>
    </footer>
  );
}