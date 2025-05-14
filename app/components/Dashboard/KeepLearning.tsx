"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { useAppContext } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Session {
  id: string;
  url: string;
  username: string;
  title: string;
  createdAt: string;
  fileType: string;
}

interface JWTPayload {
  username?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export default function KeepLearning() {
  const { theme } = useAppContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({});
  const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({});
  const hasShownToast = useRef(false);
  const router = useRouter();

  // Load cached thumbnails from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("thumbnailCache");
      if (cached) {
        setThumbnailCache(JSON.parse(cached));
      }
    }
  }, []);

  // Save thumbnail cache to localStorage whenever it updates
  useEffect(() => {
    if (Object.keys(thumbnailCache).length > 0 && typeof window !== "undefined") {
      localStorage.setItem("thumbnailCache", JSON.stringify(thumbnailCache));
    }
  }, [thumbnailCache]);

  // GraphQL query with username variable
  const query = `
    query GetSessions($username: String!) {
      getSessions(username: $username) {
        id
        url
        username
        title
        createdAt
        fileType
      }
    }
  `;

  // Function to extract username from JWT and save to localStorage
  const getUsernameFromToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      console.log("Using username from localStorage:", storedUsername);
      return storedUsername;
    }

    const token = localStorage.getItem("Token");
    if (!token) {
      console.warn("No JWT token found in localStorage under 'Token'");
      return null;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      console.log("Decoded JWT payload:", decoded);
      if (!decoded.username) {
        console.warn("No 'username' field found in JWT payload");
        return null;
      }
      localStorage.setItem("username", decoded.username);
      console.log("Saved username to localStorage:", decoded.username);
      return decoded.username;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }, []);

  // Function to check if a string is a valid URL
  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  // Function to clean session title
  const cleanTitle = useCallback((title: string): string => {
    try {
      const parsed = JSON.parse(title);
      return typeof parsed === "object" && parsed.title ? parsed.title : title;
    } catch {
      return title.replace(/[{}\[\]"]/g, "").trim();
    }
  }, []);

  // Function to validate hostname against allowed patterns
  const isValidHostname = useCallback((url: string): boolean => {
    try {
      const { hostname } = new URL(url);
      const allowedPatterns = [
        "img.tiktok.com",
        /\.tiktokcdn\.com$/,
        /\.tiktokcdn-us\.com$/,
      ];
      return allowedPatterns.some((pattern) =>
        typeof pattern === "string" ? hostname === pattern : pattern.test(hostname)
      );
    } catch {
      return false;
    }
  }, []);

  // Function to fetch TikTok thumbnail using oEmbed API
  const getTikTokThumbnail = useCallback(
    async (url: string): Promise<string> => {
      if (thumbnailCache[url]) {
        return thumbnailCache[url];
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("Failed to fetch TikTok thumbnail");
        }
        const data = await response.json();
        const thumbnailUrl = data.thumbnail_url || "/fallback.png";
        if (!isValidHostname(thumbnailUrl)) {
          console.warn(`Invalid hostname for TikTok thumbnail: ${thumbnailUrl}`);
          return "/fallback.png";
        }
        setThumbnailCache((prev) => ({ ...prev, [url]: thumbnailUrl }));
        return thumbnailUrl;
      } catch (error) {
        console.error("Error fetching TikTok thumbnail:", error);
        return "/fallback.png";
      }
    },
    [isValidHostname, thumbnailCache]
  );

  // Function to extract file extension from URL
  const getFileExtension = useCallback((url: string): string | null => {
    try {
      const { pathname } = new URL(url);
      const filename = pathname.split("/").pop();
      if (!filename) return null;
      const parts = filename.split(".");
      if (parts.length < 2) return null;
      return parts.pop()?.toLowerCase() || null;
    } catch (error) {
      console.warn(`Failed to parse URL for extension: ${url}`, error);
      return null;
    }
  }, []);

  // Function to determine the display image based on URL
  const getDisplayImage = useCallback(
    async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
      if (!url || !isValidUrl(url)) {
        console.log(`Using text.webp fallback for invalid URL: ${url}`);
        return { imageUrl: "/text.webp", isPdf: false };
      }

      const youtubeId = getYouTubeVideoId(url);
      if (youtubeId) {
        return { imageUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, isPdf: false };
      }

      if (url.includes("tiktok.com")) {
        const thumbnailUrl = await getTikTokThumbnail(url);
        return { imageUrl: thumbnailUrl, isPdf: false };
      }

      const extension = getFileExtension(url);
      console.log(`URL: ${url}, Extracted extension: ${extension}`);
      switch (extension) {
        case "pdf":
          return { imageUrl: "/pdf.png", isPdf: true };
        case "mp3":
          return { imageUrl: "/mp3.jpg", isPdf: false };
        case "mp4":
        case "m4v":
        case "webm":
        case "ogg":
        case "m4a":
        case "wav":
          return { imageUrl: "/recorder.png", isPdf: false };
        default:
          console.warn(`No matching extension for URL: ${url}`);
          return { imageUrl: "/text.webp", isPdf: false };
      }
    },
    [getYouTubeVideoId, getTikTokThumbnail, getFileExtension, isValidUrl]
  );

  // Function to fetch images in batches
  const fetchImagesInBatches = useCallback(
    async (sessions: Session[], batchSize: number = 5) => {
      const imageMap: { [key: string]: { imageUrl: string; isPdf: boolean } } = {};
      for (let i = 0; i < sessions.length; i += batchSize) {
        const batch = sessions.slice(i, i + batchSize);
        const imagePromises = batch.map(async (session) => {
          const { imageUrl, isPdf } = await getDisplayImage(session.url);
          return { id: session.id, imageUrl, isPdf };
        });
        const images = await Promise.all(imagePromises);
        images.forEach(({ id, imageUrl, isPdf }) => {
          imageMap[id] = { imageUrl, isPdf };
        });
        setSessionImages((prev) => ({ ...prev, ...imageMap }));
      }
      return imageMap;
    },
    [getDisplayImage]
  );

  // Function to handle session deletion
  const handleDeleteSession = async (id: string, username: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent event bubbling to Link
    try {
      const token = localStorage.getItem("Token");
      const mutation = `
        mutation DeleteSession($id: ID!, $username: String!) {
          deleteSession(id: $id, username: $username)
        }
      `;
      const variables = { id, username };
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.status}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL error");
      }

      // Update sessions state to remove the deleted session
      setSessions((prev) => prev.filter((session) => session.id !== id));
      toast.success("Session deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete session";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const username = getUsernameFromToken();
      if (!username) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          setError("Please log in to view sessions.");
          toast.error("Authentication required. Please log in.");
        }
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        const token = localStorage.getItem("Token");
        const queryBody = JSON.stringify({ query, variables: { username } });
        console.log("GraphQL Query Body:", queryBody);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: queryBody,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.status}`);
        }

        const result = await response.json();
        console.log("Raw GraphQL response:", result);
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL error");
        }

        const fetchedSessions = result.data?.getSessions || [];
        console.log("Fetched sessions:", fetchedSessions);
        setSessions(fetchedSessions);
        await fetchImagesInBatches(fetchedSessions);
      } catch (err: unknown) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    return () => {
      hasShownToast.current = false;
    };
  }, [getUsernameFromToken, router, fetchImagesInBatches, query]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div
      className={`flex-shrink-0 w-52 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center animate-pulse ${
        theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-gray-100 border-gray-300'
      }`}
    >
      <div className={`relative w-full h-24 sm:h-28 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      <div className="mt-3">
        <div className={`h-5 rounded w-3/4 mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        <div className={`h-4 rounded w-1/2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      </div>
    </div>
  );

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-lg sm:text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        >
          Keep learning
        </h2>
        <Link href="/history">
          <h2
            className={`text-sm sm:text-base hover:underline ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            View all
          </h2>
        </Link>
      </div>
      {error ? (
        <div
          className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
        >
          {error}
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : sessions.length === 0 ? (
            <div
              className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              No sessions found.
            </div>
          ) : (
            sessions.map((session) => {
              if (!session.url && session.fileType !== "text") {
                console.warn(`Skipping session ${session.id}: Missing url and fileType is not 'text'`);
                return null;
              }
              return (
                <Link
                  key={session.id}
                  href={{
                    pathname: "/content",
                    query: {
                      url: session.url || "",
                      id: session.id,
                      fileType: session.fileType || "",
                    },
                  }}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("topicUrl", session.url || "");
                      sessionStorage.setItem("topicId", session.id);
                      sessionStorage.setItem("fileType", session.fileType || "");
                    }
                  }}
                >
                  <div
                    className={`flex-shrink-0 w-52 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300 ${
                      theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                      <Image
                        src={sessionImages[session.id]?.imageUrl || "/text.webp"}
                        alt={`Session ${session.title}`}
                        layout="fill"
                        objectFit={sessionImages[session.id]?.isPdf ? "contain" : "cover"}
                        className="rounded-lg transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.warn(`Image failed to load for session ${session.id}: ${sessionImages[session.id]?.imageUrl}`);
                          e.currentTarget.src = "/text.webp";
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <h3
                        className={`text-sm sm:text-sm font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}
                      >
                        {cleanTitle(session.title)}
                      </h3>
                      <p
                        className={`text-sm sm:text-sm flex items-center justify-between ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(session.createdAt)}
                        <Trash2
                          className="h-4 w-4 cursor-pointer hover:text-red-500"
                          onClick={(e) => handleDeleteSession(session.id, session.username, e)}
                        />
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}