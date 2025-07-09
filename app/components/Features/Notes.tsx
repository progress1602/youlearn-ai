"use client"
import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAppContext } from "@/context/AppContext"
import { useSearchParams } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function Notes() {
  const { theme } = useAppContext()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id")

  // Remove unused notes state
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Fix typo: isgettingNotes -> isGettingNotes
  const [isGettingNotes, setIsGettingNotes] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  // Add auto-save states
  const [isSaving, setIsSaving] = useState(false)
  // const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Ref for the debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)

  // Wrap getNotes in useCallback to avoid dependency warning
  const getNotes = useCallback(async () => {
    const notesQuery = `
      query GetSession($id: ID!) {
        getSession(id: $id) {
          note{
            id
            sessionId
            content
          }
        }
      }`

    if (!sessionId) {
      setError("Session ID is missing")
      return
    }

    setIsGettingNotes(true)
    setNotesError(null)

    try {
      const req = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: notesQuery,
          variables: {
            id: sessionId,
          },
        }),
      })

      const { data, errors } = await req.json()

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to fetch notes")
      }

      if (data?.getSession?.note) {
        // Removed: setNotesData(data.getSession.note)
        setNewNote(data.getSession.note.content || "") // Set content or empty string
      } else {
        setNewNote("")
      }
    } catch (err) {
      console.log("Error fetching notes:", err)
      setNotesError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsGettingNotes(false)
      initialLoadRef.current = false // Mark initial load as complete
    }
  }, [sessionId])

  // Only depend on sessionId and getNotes
  useEffect(() => {
    getNotes()
  }, [sessionId, getNotes])

  const addNote = useCallback(async () => {
    if (newNote.trim() === "" || loading || isSaving) return // Prevent saving if loading or empty

    if (!sessionId) {
      setError("Session ID is missing")
      return
    }

    setLoading(true)
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query AddNoteToSession($sessionId: ID!, $note: String!) {
              addNoteToSession(sessionId: $sessionId, note: $note) {
                id
                sessionId
                content
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            sessionId: sessionId,
            note: newNote,
          },
        }),
      })

      const { data, errors } = await response.json()

      if (errors) {
        throw new Error(errors[0]?.message || "Failed to add note")
      }

      if (data?.addNoteToSession) {
        // Removed: setNotesData(data.addNoteToSession)
        // Note is already in newNote state, so no need to update it again
        // setLastSaved(new Date())
      } else {
        throw new Error("No data returned from query")
      }
    } catch (err) {
      console.error("Error adding note:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setIsSaving(false)
    }
  }, [newNote, loading, isSaving, sessionId])

  // Auto-save function with debounce
  const autoSave = useCallback(() => {
    // Don't auto-save during initial load
    if (initialLoadRef.current) return
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      addNote()
    }, 2000)
  }, [addNote])

  // Handle text change with auto-save
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value)
    autoSave()
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Debug: Log keydown event
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("Key pressed:", e.key, "Shift:", e.shiftKey)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Clear the auto-save timeout and save immediately
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      addNote()
    }
  }

  return isGettingNotes ? (
    <h1>Loading Notes...</h1>
  ) : (
    <div className={`p-8 w-full max-w-3xl mx-auto ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>Notes</h1>
        
        {/* Auto-save status indicator */}
        <div className="flex items-center space-x-2">
          {isSaving && (
            <span className="text-blue-500 text-sm">Saving...</span>
          )}
          {/* {lastSaved && !isSaving && (
            <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Saved at {lastSaved.toLocaleTimeString()}
            </span>
          )} */}
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {notesError && <p className="text-red-500 mb-4">Notes Error: {notesError}</p>}
      {/* {loading && <p className="text-blue-500 mb-4">Adding note...</p>} */}
      {!sessionId && !error && <p className="text-red-500 mb-4">Error: Session ID is required</p>}

      <div className="">
        <textarea
          className={`w-full p-4 min-h-[24rem] sm:min-h-[24rem] md:min-h-[24rem] lg:min-h-[24rem] focus:outline-none rounded-lg text-sm sm:text-sm md:text-base lg:text-base ${
            theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"
          }`}
          rows={4}
          placeholder="Write a new note..."
          value={newNote}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}