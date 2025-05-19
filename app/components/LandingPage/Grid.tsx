"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClipboardList } from "lucide-react";
import Image from "next/image";
import { Chat, ArrowFatLineUp, Microphone } from "phosphor-react";
import { useAppContext } from "@/context/AppContext";

export default function FeatureGrid() {
  const { theme } = useAppContext();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const imageVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="mt-20">
      {/* Header Text */}
      <div className="mt-36 text-center px-4">
        <p className={`text-3xl sm:text-4xl md:text-5xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Save hours, learn smarter
        </p>
        <p className={`text-[18px] sm:text-[20px] md:text-[23px] mt-6 ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'} font-sans`}>
          From key takeaways to specific questions, we&apos;ve got you covered
        </p>
      </div>

      {/* Main Feature Section */}
      <div className={`flex flex-col md:flex-row gap-6 p-4 max-w-full md:max-w-6xl mx-auto mt-16 border rounded-l-4xl rounded-tr-4xl ${theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#F6F6F6] border-gray-200'}`}>
        {/* Text Section */}
        <div className="mt-5 md:ml-8 flex flex-col justify-start px-4 md:px-0">
          <Chat size={24} weight="fill" color={theme === 'dark' ? '#ffffff' : '#000000'} />
          <p className={`mt-5 text-[18px] md:text-lg font-bold font-sans ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Summary, flashcards, quizzes, voice mode, and more
          </p>
          <p className={`mt-3 text-[15px] md:text-[17px] font-sans font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'}`}>
            Understand the key points, test your{" "}
            <br className="hidden sm:inline" />
            knowledge, get answers with references, and{" "}
            <br className="hidden sm:inline" />
            talk with an AI tutor.
          </p>
        </div>

        {/* Image Section */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={imageVariants}
          className="w-full md:w-3/4 px-4 md:px-0"
        >
          <div className="w-full md:h-[750px] h-auto relative">
            <Image
              src="/ai-2.jpg"
              alt="Placeholder"
              width={800}
              height={900}
              className="w-full h-full object-cover rounded-2xl"
              style={{ objectPosition: "center" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Feature Grid */}
      <div className="flex flex-col md:flex-row gap-4 p-4 max-w-full md:max-w-6xl mx-auto mt-5">
        <div className={`rounded-4xl p-6 flex-1 border ${theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#F6F6F6] border-gray-200'}`}>
          <div className="mb-6 mt-2">
            <ArrowFatLineUp size={24} weight="fill" color={theme === 'dark' ? '#ffffff' : '#000000'} />
          </div>
          <h2 className={`text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Upload any content
          </h2>
          <p className={`text-sm sm:text-md font-semibold font-sans ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'}`}>
            From PDFs and YouTube videos to slides and even recorded lectures,
            learn everything your way.
          </p>
        </div>

        <div className={`rounded-4xl p-6 flex-1 border ${theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#F6F6F6] border-gray-200'}`}>
          <div className="mb-6 mt-2">
            <ClipboardList className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </div>
          <h2 className={`text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Test your knowledge
          </h2>
          <p className={`text-sm sm:text-md font-semibold font-sans ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'}`}>
            Create personalized exams, get answer breakdowns, and track your
            progress.
          </p>
        </div>

        <div className={`rounded-4xl p-6 flex-1 border ${theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#F6F6F6] border-gray-200'}`}>
          <div className="mb-6 mt-2">
            <Microphone size={24} weight="fill" color={theme === 'dark' ? '#ffffff' : '#000000'} />
          </div>
          <h2 className={`text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Talk with an AI Tutor
          </h2>
          <p className={`text-sm sm:text-md font-semibold font-sans ${theme === 'dark' ? 'text-gray-300' : 'text-[#6D6D6D]'}`}>
            Talk to an AI tutor to simplify ideas and receive guidance on the
            content.
          </p>
        </div>
      </div>
    </div>
  );
}