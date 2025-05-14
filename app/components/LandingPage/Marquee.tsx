"use client";

import Image from 'next/image';
import { useAppContext } from "@/context/AppContext";

const Marquee = () => {
  const { theme } = useAppContext();

  // Array of logos
  const logos = [
    '/logo.png',
    '/logo.png',
    '/logo.png',
    '/logo.png',
    '/logo.png',
    '/logo.png',
    '/logo.png',
  ];

  return (
    <div className={`relative flex flex-col items-center justify-start ${theme === 'dark' ? 'bg-[#2a2a2a]2' : 'bg-white'} mt-10`}>
      {/* Text above the marquee */}
      <h1 className={`text-md md:text-xl font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} font-sans mb-4 tracking-widest`}>
        Trusted by top students all over the world
      </h1>

      {/* Marquee Container with max-w-4xl */}
      <div className="relative w-full max-w-3xl mt-5 md:mt-10 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[url('/grid.png')] bg-repeat opacity-20 z-0" />

        {/* Fade effect on both ends */}
        <div className={`pointer-events-none absolute left-0 top-0 h-full w-20 z-10 bg-gradient-to-r ${theme === 'dark' ? 'from-[#1a1a1a] to-transparent' : 'from-white to-transparent'} backdrop-blur-sm`} />
        <div className={`pointer-events-none absolute right-0 top-0 h-full w-20 z-10 bg-gradient-to-l ${theme === 'dark' ? 'from-[#1a1a1a] to-transparent' : 'from-white to-transparent'} backdrop-blur-sm`} />

        {/* Marquee Content */}
        <div className="relative flex items-center animate-marquee whitespace-nowrap z-20">
          {logos.map((logo, index) => (
            <div key={index} className="flex-shrink-0 mx-6">
              <Image
                src={logo}
                alt={`Logo ${index + 1}`}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          ))}
          {/* Duplicate logos for seamless scrolling */}
          {logos.map((logo, index) => (
            <div key={`duplicate-${index}`} className="flex-shrink-0 mx-6">
              <Image
                src={logo}
                alt={`Logo ${index + 1}`}
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;