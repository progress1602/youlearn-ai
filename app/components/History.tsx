"use client"
import { useAppContext } from "@/context/AppContext"
import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { jwtDecode } from "jwt-decode"
import { Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface Session {
  id: string
  url: string
  username: string
  title: string
  createdAt: string
  fileType?: string
}

interface JWTPayload {
  username?: string
  [key: string]: string | number | boolean | null | undefined
}

// Utility to sanitize strings for XSS prevention
const sanitizeString = (str?: string): string => {
  if (typeof str !== "string") return ""
  return str.replace(
    /[<>"'&]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "&": "&amp;",
      })[char]!,
  )
}

export default function History() {
  const { sideBarOpen, setSideBarOpen, theme } = useAppContext()
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({})
  const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({})
  const router = useRouter()

  // Load cached thumbnails from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("thumbnailCache")
      if (cached) {
        try {
          setThumbnailCache(JSON.parse(cached))
        } catch (e) {
          console.error("Failed to parse thumbnail cache:", e)
        }
      }
    }
  }, [])

  // Save thumbnail cache to localStorage whenever it updates
  useEffect(() => {
    if (Object.keys(thumbnailCache).length > 0 && typeof window !== "undefined") {
      localStorage.setItem("thumbnailCache", JSON.stringify(thumbnailCache))
    }
  }, [thumbnailCache])

  // GraphQL query with username variable
  const query = `
    query getSessions($username: String!) {
      getSessions(username: $username) {
        id
        url
        username
        title
        createdAt
        fileType
      }
    }
  `

  // Function to extract username from JWT
  const getUsernameFromToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("Token")
    if (!token) {
      console.warn("No JWT token found in localStorage under 'Token'")
      return null
    }
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      if (!decoded.username) {
        console.warn("No 'username' field found in JWT payload")
        return null
      }
      return decoded.username
    } catch (error) {
      console.error("Error decoding JWT:", error)
      return null
    }
  }, [])

  // Function to check if a string is a valid URL
  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }, [])

  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }, [])

  const isValidHostname = useCallback((url: string): boolean => {
    try {
      const { hostname } = new URL(url)
      const allowedPatterns = ["img.tiktok.com", /\.tiktokcdn\.com$/, /\.tiktokcdn-us\.com$/]
      return allowedPatterns.some((pattern) =>
        typeof pattern === "string" ? hostname === pattern : pattern.test(hostname),
      )
    } catch {
      return false
    }
  }, [])

  const getTikTokThumbnail = useCallback(
    async (url: string): Promise<string> => {
      if (thumbnailCache[url]) {
        return thumbnailCache[url]
      }
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        if (!response.ok) {
          throw new Error("Failed to fetch TikTok thumbnail")
        }
        const data = await response.json()
        const thumbnailUrl = data.thumbnail_url || "/text.webp"
        if (!isValidHostname(thumbnailUrl)) {
          console.warn(`Invalid hostname for TikTok thumbnail: ${thumbnailUrl}`)
          return "/text.webp"
        }
        setThumbnailCache((prev) => ({ ...prev, [url]: thumbnailUrl }))
        return thumbnailUrl
      } catch (error) {
        console.error("Error fetching TikTok thumbnail:", error)
        return "/text.webp"
      }
    },
    [isValidHostname, thumbnailCache],
  )

  const getFileExtension = useCallback((url: string): string | null => {
    try {
      const { pathname } = new URL(url)
      const filename = pathname.split("/").pop()
      if (!filename) return null
      const parts = filename.split(".")
      if (parts.length < 2) return null
      return parts.pop()?.toLowerCase() || null
    } catch (error) {
      console.warn(`Failed to parse URL for extension: ${url}`, error)
      return null
    }
  }, [])

  const getDisplayImage = useCallback(
    async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
      if (!url || !isValidUrl(url)) {
        return { imageUrl: "/text.webp", isPdf: false }
      }

      const youtubeId = getYouTubeVideoId(url)
      if (youtubeId) {
        return { imageUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, isPdf: false }
      }

      if (url.includes("tiktok.com")) {
        const thumbnailUrl = await getTikTokThumbnail(url)
        return { imageUrl: thumbnailUrl, isPdf: false }
      }

      const extension = getFileExtension(url)
      switch (extension) {
        case "pdf":
          return { imageUrl: "/pdf.png", isPdf: true }
        case "mp3":
          return { imageUrl: "/mp3.jpg", isPdf: false }
        case "mp4":
        case "m4v":
        case "webm":
        case "ogg":
        case "m4a":
        case "wav":
          return { imageUrl: "/recorder.png", isPdf: false }
        default:
          console.warn(`No matching extension for URL: ${url}`)
          return { imageUrl: "/text.webp", isPdf: false }
      }
    },
    [getYouTubeVideoId, getTikTokThumbnail, getFileExtension, isValidUrl],
  )

  const fetchImagesInBatches = useCallback(
    async (sessions: Session[], batchSize = 5) => {
      const imageMap: { [key: string]: { imageUrl: string; isPdf: boolean } } = {}
      for (let i = 0; i < sessions.length; i += batchSize) {
        const batch = sessions.slice(i, i + batchSize)
        const imagePromises = batch.map(async (session) => {
          const { imageUrl, isPdf } = await getDisplayImage(session.url)
          return { id: session.id, imageUrl, isPdf }
        })
        const images = await Promise.all(imagePromises)
        images.forEach(({ id, imageUrl, isPdf }) => {
          imageMap[id] = { imageUrl, isPdf }
        })
        setSessionImages((prev) => ({ ...prev, ...imageMap }))
      }
      return imageMap
    },
    [getDisplayImage],
  )

  // Function to handle session deletion
  const handleDeleteSession = async (id: string, username: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const token = localStorage.getItem("Token")
      const mutation = `
        mutation DeleteSession($id: ID!, $username: String!) {
          deleteSession(id: $id, username: $username)
        }
      `
      const variables = { id, username }
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query: mutation, variables }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.status}`)
      }

      const result = await response.json()
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL error")
      }

      setSessions((prev) => prev.filter((session) => session.id !== id))
      toast.success("Session deleted successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete session"
      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    const fetchSessions = async () => {
      const username = getUsernameFromToken()
      if (!username) {
        setError("Please log in to view sessions.")
        setLoading(false)
        toast.error("Authentication required. Please log in.")
        router.push("/login")
        return
      }

      try {
        setLoading(true)
        const token = localStorage.getItem("Token")
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ query, variables: { username } }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.status}`)
        }

        const result = await response.json()
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL error")
        }

        const fetchedSessions: Session[] = result.data?.getSessions || []
        const validSessions = fetchedSessions.filter((session) => session.url || session.fileType === "text")
        setSessions(validSessions)
        await fetchImagesInBatches(validSessions)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [fetchImagesInBatches, getUsernameFromToken, router, query])

  useEffect(() => {
    if (typeof window !== "undefined") {
      let timeout: NodeJS.Timeout
      const handleResize = () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          const mobile = window.innerWidth < 768
          setIsMobile(mobile)
          setSideBarOpen(!mobile)
        }, 100)
      }

      setIsMobile(window.innerWidth < 768)
      setSideBarOpen(window.innerWidth >= 768)
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        clearTimeout(timeout)
      }
    }
  }, [setSideBarOpen])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const cleanTitle = useCallback((title: string): string => {
    try {
      const parsed = JSON.parse(title)
      return typeof parsed === "object" && parsed.title
        ? sanitizeString(parsed.title)
        : sanitizeString(title.replace(/[{}[\]"]/g, "").trim())
    } catch {
      return sanitizeString(title.replace(/[{}[\]"]/g, "").trim())
    }
  }, [])

  const SkeletonCard = () => (
    <div
      className={`w-64 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between ${
        theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"
      }`}
    >
      <div
        className={`relative w-full h-24 sm:h-28 rounded-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
        } animate-pulse`}
      />
      <div className="relative mt-2 z-10">
        <div className={`h-5 rounded w-3/4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse mb-2`} />
        <div className={`h-4 rounded w-1/2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"} animate-pulse`} />
      </div>
    </div>
  )

  const handleSessionClick = (session: Session) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("topicUrl", session.url || "")
      sessionStorage.setItem("topicId", session.id || "")
      sessionStorage.setItem("fileType", session.fileType || "")
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {sideBarOpen && isMobile && (
        <div
          className={`fixed inset-0 bg-opacity-50 z-10 ${theme === "dark" ? "bg-black" : "bg-gray-500"}`}
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${sideBarOpen && !isMobile ? "ml-72" : "ml-0"} transition-all duration-300 flex flex-col`}
      >
        <header
          className={`w-full p-4 flex items-center justify-between sticky top-0 z-10 ${
            theme === "dark" ? "bg-[#1a1a1a]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {(!sideBarOpen || isMobile) && (
              <button
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
                onClick={() => setSideBarOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {!sideBarOpen && (
              <Image src="/cloudnotte-logo.png" alt="Logo" width={150} height={150} className="hidden md:block" />
            )}
          </div>
        </header>

        <div className={`md:mt-2 lg:mt-2 ${!sideBarOpen ? "pl-5" : ""}`}>
          <div className={`text-3xl ${theme === "dark" ? "text-white" : "text-black"}`}>My Learning</div>
          <hr
            className={`border-t mt-5 ${
              theme === "dark" ? "border-gray-700" : "border-gray-300"
            } ${!sideBarOpen ? "md:w-[79rem]" : "md:w-[65rem]"}`}
          />
        </div>

        {/* Updated grid container with mobile-centered layout */}
        <div
          className={`
            ${!sideBarOpen ? "md:ml-20" : ""} 
            grid gap-2 mt-6
            grid-cols-1 justify-items-center px-4
            md:grid-cols-4 md:justify-items-start md:px-0 md:w-[90%]
            lg:grid-cols-4 lg:justify-items-start lg:px-0 lg:w-[90%]
          `}
        >
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className={`col-span-full text-center ${theme === "dark" ? "text-red-500" : "text-red-600"}`}>
              {sanitizeString(error)}
            </div>
          ) : sessions.length === 0 ? (
            <div className={`col-span-full text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              No sessions found.
            </div>
          ) : (
            sessions.map((session) => {
              if (!session.url && session.fileType !== "text") {
                console.warn(`Skipping session ${session.id}: Missing url and fileType is not 'text'`)
                return null
              }

              return (
                <Link
                  key={session.id}
                  href={{
                    pathname: "/content",
                    query: {
                      url: session.url || "",
                      id: session.id || "",
                      fileType: session.fileType || "",
                    },
                  }}
                  onClick={() => handleSessionClick(session)}
                >
                  <div
                    className={`w-64 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between hover:shadow-xl transition-all duration-300 ${
                      theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"
                    }`}
                  >
                    <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                      <Image
                        src={sessionImages[session.id]?.imageUrl || "/text.webp"}
                        alt={`Session ${sanitizeString(cleanTitle(session.title))}`}
                        fill
                        style={{
                          objectFit: sessionImages[session.id]?.isPdf ? "contain" : "cover",
                        }}
                        className="rounded-lg transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.warn(
                            `Image failed to load for session ${session.id}: ${sessionImages[session.id]?.imageUrl}`,
                          )
                          e.currentTarget.src = "/text.webp"
                        }}
                      />
                    </div>
                    <div className="relative mt-2 z-10">
                      <h3
                        className={`text-md font-semibold truncate ${theme === "dark" ? "text-white" : "text-black"}`}
                        title={sanitizeString(cleanTitle(session.title))}
                      >
                        {sanitizeString(cleanTitle(session.title))}
                      </h3>
                      <p
                        className={`text-sm flex items-center justify-between ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {formatDate(session.createdAt)}
                        <button
                          aria-label={`Delete session ${sanitizeString(cleanTitle(session.title))}`}
                          onClick={(e) => handleDeleteSession(session.id, session.username, e)}
                        >
                          <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" />
                        </button>
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
