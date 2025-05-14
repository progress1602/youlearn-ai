"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAppContext } from "@/context/AppContext";

export default function Navbar() {
  const { theme } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full ${theme === 'dark' ? 'bg-[#1a1a1a]/80' : 'bg-white/80'} backdrop-blur-md z-50 shadow-`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo + Links */}
          <div className="flex items-center space-x-10">
            <a href="#" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
              />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-sans-serif`}>Features</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-sans-serif`}>Pricing</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} font-sans-serif`}>Careers</a>
            </div>
          </div>

          {/* Right section: CTA Button */}
          <div className='hidden sm:block'>
            <Link href="/auth">
              <div className="mt-4 px-3 pb-2">
                <button className="w-full bg-gradient-to-r from-[#0F4C81] via-[#5A3F59] to-[#C92A1F] text-white px-4 py-2 rounded-full font-medium">
                  Get Started
                </button>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} focus:outline-none`}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <Menu className="h-6 w-6" aria-hidden="true" />
              ) : (
                <X className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} mt-2`}></div>

      {/* Mobile menu */}
      <div className={`md:hidden ${theme === 'dark' ? 'bg-[#1a1a1a]/95' : 'bg-white/95'} backdrop-blur-md ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#" className={`block px-3 py-2 rounded-md text-base font-sans-serif font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
            Features
          </a>
          <a href="#" className={`block px-3 py-2 rounded-md text-base font-sans-serif font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
            Pricing
          </a>
          <a href="#" className={`block px-3 py-2 rounded-md text-base font-sans-serif font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
            Careers
          </a>
          <Link href="/auth">
            <div className="mt-4 px-3 pb-2">
              <button className="w-full bg-gradient-to-r from-[#0F4C81] via-[#5A3F59] to-[#C92A1F] text-white px-4 py-2 rounded-full font-medium">
                Get Started
              </button>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}