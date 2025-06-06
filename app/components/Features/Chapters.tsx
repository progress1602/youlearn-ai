"use client"

import type React from "react"
import { RefreshCcw } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

interface Chapter {
  title: string
  summary: string
  startTime: string
  pageNumber: number
}

interface ChaptersProps {
  chapters: Chapter[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const Chapters: React.FC<ChaptersProps> = ({ chapters, loading, error, refetch }) => {
  const { theme } = useAppContext()

  const SkeletonLoader = () => (
    <div className="space-y-4 md:ml-20 lg:ml-20">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`p-4 w-80 rounded-lg border animate-pulse ${
            theme === "dark" ? "border-gray-800 bg-[#121212]" : "border-gray-300 bg-white"
          }`}
        >
          <div className={`h-6 rounded w-3/4 mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-4 rounded w-full mb-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-4 rounded w-5/6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-3 rounded w-1/4 mt-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
        </div>
      ))}
    </div>
  )

  return (
    <div
      className={`p-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mx-auto max-w-3xl ${
        theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold">Chapters</p>
        <RefreshCcw
          className="h-5 w-5 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={refetch}
        />
      </div>
      <div className="text-sm mt-4">
        {loading && <SkeletonLoader />}
        {!loading && error && chapters.length === 0 && (
          <div className={`text-center ${theme === "dark" ? "text-red-400" : "text-red-600"} mb-4`}>
            <p>Failed to load chapters: {error}</p>
          </div>
        )}
        {!loading && chapters.length === 0 && !error && (
          <div className="text-center">
            <p>No chapters available.</p>
          </div>
        )}
        {!loading &&
          chapters.length > 0 &&
          chapters.map((chapter, index) => (
            <div
              key={index}
              className={`hover:bg-opacity-50 p-4 rounded-lg mt-2 transition-colors duration-200 border ${
                theme === "dark" ? "hover:bg-gray-900 border-gray-800" : "hover:bg-gray-100 border-gray-300"
              }`}
            >
              <p className="font-black text-[1.1rem]">
                {chapter.startTime} - {chapter.title}
              </p>
              <p className="mt-1">{chapter.summary}</p>
              <p className={`mt-1 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Page {chapter.pageNumber}
              </p>
            </div>
          ))}
      </div>
    </div>
  )
}