"use client";

import Image from 'next/image';
import { useAppContext } from "@/context/AppContext";

const MyComponent = () => {
  const { theme } = useAppContext();

  return (
    <div className='mt-20 sm:mt-32'>
        <div className='px-4 sm:px-6'>
            <p className={`flex items-center justify-center text-2xl sm:text-3xl md:text-[40px] font-sans font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Built for any use case
            </p>
            <p className={`flex items-center justify-center text-lg sm:text-lg md:text-[19px] mt-3 sm:mt-5 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'}`}>
              Click on a learning content below, and start your learning journey
            </p>
        </div>
    <div className="flex flex-col md:flex-row gap-10 sm:gap-6 p-4 sm:p-6 max-w-7xl mx-auto h-auto md:h-[400px] mt-8 sm:mt-12">
      <div className="flex-1 flex flex-col">
        <div className={`rounded-2xl sm:rounded-3xl border flex-1 relative overflow-hidden aspect-[4/3] md:aspect-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <Image 
            src="/grid1.png"  
            alt="Upload content" 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover rounded-2xl sm:rounded-3xl"
          />
        </div>
        <div className="mt-4 sm:mt-6">
          <h3 className={`text-xl sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            The Genetic Code and Translation
          </h3>
          <p className={`text-lg sm:text-md font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} mt-2 sm:mt-3`}>
            DNA translates to protein sequences.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className={`rounded-2xl sm:rounded-3xl border flex-1 relative overflow-hidden aspect-[4/3] md:aspect-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <Image 
            src="/grid2.avif"  
            alt="Test your knowledge" 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover rounded-2xl sm:rounded-3xl"
          />
        </div>
        <div className="mt-4 sm:mt-6">
          <h3 className={`text-xl sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Introduction to the Human Brain
          </h3>
          <p className={`text-lg sm:text-md font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} mt-2 sm:mt-3`}>
            MIT 9.13 The Human Brain, Spring 2019
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className={`rounded-2xl sm:rounded-3xl border flex-1 relative overflow-hidden aspect-[4/3] md:aspect-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <Image 
            src="/grid3.avif"  
            alt="Talk with AI tutor" 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover rounded-2xl sm:rounded-3xl"
          />
        </div>
        <div className="mt-4 sm:mt-6">
          <h3 className={`text-xl sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Cognitive Psychology: An Intro
          </h3>
          <p className={`text-lg sm:text-md font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} mt-2 sm:mt-3`}>
            Mind&apos;s mechanisms scientifically explored.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MyComponent;