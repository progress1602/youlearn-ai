import Link from "next/link";
import Image from "next/image";

export default function ExploreTopics() {
  return (
    <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl mt-6 sm:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Explore topics</h2>
        <Link href="/">
          <h2 className="text-sm sm:text-base text-gray-400 hover:text-white">
            Close all
          </h2>
        </Link>
      </div>
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
        <Link href="/content">
          <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
            <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
              <Image
                src="/pdf.png"
                alt="Introduction to Biology"
                layout="fill"
                objectFit="contain"
                className="rounded-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Introduction to Biology
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Learn the basics of cells...
              </p>
            </div>
          </div>
        </Link>
        <Link href="/content">
          <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
            <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
              <Image
                src="/recorder.png"
                alt="The Map of Chemistry"
                layout="fill"
                objectFit="contain"
                className="rounded-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                The Map of Chemistry
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Explore the branches...
              </p>
            </div>
          </div>
        </Link>
        <Link href="/content">
          <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
            <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
              <Image
                src="/pdf.png"
                alt="Cognitive Psychology"
                layout="fill"
                objectFit="contain"
                className="rounded-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Cognitive Psychology
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                An introduction...
              </p>
            </div>
          </div>
        </Link>
        <Link href="/content">
          <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
            <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
              <Image
                src="/mp3.jpg"
                alt="Another Topic"
                layout="fill"
                objectFit="contain"
                className="rounded-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-3">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Another Topic
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Description...
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}