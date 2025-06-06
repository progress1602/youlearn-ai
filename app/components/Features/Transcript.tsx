"use client"

import type React from "react"
import { RefreshCcw } from "lucide-react"
import { useAppContext } from "@/context/AppContext"

interface TranscriptsProps {
  transcripts: string[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const Transcripts: React.FC<TranscriptsProps> = ({ transcripts, loading, error, refetch }) => {
  const { theme } = useAppContext()

  if (loading) {
    return (
      <div className={`p-4 rounded-lg flex-1 ml-5 ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
        <div
          className={`h-6 w-32 rounded animate-pulse ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} mb-4`}
        ></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className={`h-6 w-full rounded animate-pulse ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg flex-1 ml-5 ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
      <div className="flex justify-between items-center">
        <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>Transcripts</p>
        <RefreshCcw
          className="h-5 w-5 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={refetch}
        />
      </div>
      {error && transcripts.length === 0 && (
        <p className={theme === "dark" ? "text-red-400" : "text-red-600"}>Error: {error}</p>
      )}
      {!error && transcripts.length > 0 ? (
        transcripts.map((transcript, index) => (
          <p key={index} className={`text-md mt-6 ${theme === "dark" ? "text-white" : "text-black"}`}>
            {transcript}
          </p>
        ))
      ) : (
        <p className={`text-md mt-2 ${theme === "dark" ? "text-white" : "text-black"}`}>No transcripts available.</p>
      )}
    </div>
  )
}

export default Transcripts