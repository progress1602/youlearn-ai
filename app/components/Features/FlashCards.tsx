"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useUrl } from "@/context/AppContext"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Flashcard {
  id: number
  question: string
}

export const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const { sessionID, } = useUrl();
  useEffect(() => {
    if (hasFetched.current) {
      console.log("Fetch skipped: already fetched")
      return
    }

    console.log("Fetching questions...")
    hasFetched.current = true

    const fetchQuestions = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query generateQuestions {
                generateQuestions(sessionId: "${sessionID ?? ''}") {
                  content
                }
              }
            `,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("API Response:", result)

        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        const generateQuestions = result.data.generateQuestions
        if (!Array.isArray(generateQuestions)) {
          throw new Error("Expected generateQuestions to be an array")
        }

        const questions: string[] = generateQuestions
          .filter((item): item is { content: string } => item && typeof item.content === "string")
          .map((item) => item.content)

        if (questions.length === 0) {
          throw new Error("No valid questions found in response")
        }

        const formattedFlashcards: Flashcard[] = questions.map((question, index) => ({
          id: index + 1,
          question,
        }))

        setFlashcards(formattedFlashcards)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        setLoading(false)
      }
    }

    fetchQuestions()

    return () => {
      hasFetched.current = false
    }
  }, [sessionID])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === flashcards.length - 1 ? 0 : prevIndex + 1))
  }

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className="flex items-center border border-gray-700 rounded-xl justify-center animate-pulse">
      <div className="relative w-full max-w-3xl aspect-[16/9] text-white">
        {/* Skeleton for flashcard content */}
        <div className="absolute inset-0 mb-10 flex items-center justify-center p-8">
          <div className="w-4/5 h-44 bg-gray-700 rounded"></div>
        </div>

        {/* Skeleton for navigation and counter */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center text-sm">
          {/* Previous button skeleton */}
          <div className="absolute left-4 w-8 h-8 bg-gray-700 rounded-full"></div>

          {/* Counter skeleton */}
          <div className="w-12 h-8 bg-gray-700 rounded"></div>

          {/* Next button skeleton */}
          <div className="absolute right-4 w-8 h-8 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <SkeletonLoader />
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>
  }

  if (flashcards.length === 0) {
    return <div className="text-white text-center">No flashcards available.</div>
  }

  return (
    <div className="flex items-center border border-gray-700 rounded-xl justify-center">
      <div className="relative w-full max-w-3xl aspect-[16/9] text-white">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p className="text-center text-lg md:text-xl">{flashcards[currentIndex].question}</p>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center text-sm">
          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={24} />
          </button>

          <span>
            {currentIndex + 1} / {flashcards.length}
          </span>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Next flashcard"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}