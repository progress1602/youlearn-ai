"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Session {
  id: string;
  url: string;
  userId: string;
  title: string;
  createdAt: string;
}

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({});
  const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({});

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

  const query = `
    query getsessions {
      getSessions {
        id
        url
        userId
        title
        createdAt
      }
    }
  `;

  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  const isValidHostname = useCallback((url: string): boolean => {
    try {
      const { hostname } = new URL(url);
      const allowedPatterns = ["img.tiktok.com", /\.tiktokcdn\.com$/, /\.tiktokcdn-us\.com$/];
      return allowedPatterns.some((pattern) =>
        typeof pattern === "string" ? hostname === pattern : pattern.test(hostname)
      );
    } catch {
      return false;
    }
  }, []);

  const getTikTokThumbnail = useCallback(
    async (url: string): Promise<string> => {
      if (thumbnailCache[url]) {
        return thumbnailCache[url];
      }

      try {
        // Add timeout to prevent hanging on slow TikTok API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

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

  const getDisplayImage = useCallback(
    async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
      if (!url) {
        return { imageUrl: "/fallback.png", isPdf: false };
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
          return { imageUrl: "/fallback.png", isPdf: false };
      }
    },
    [getYouTubeVideoId, getTikTokThumbnail, getFileExtension]
  );

  // Batch process image fetching
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
        // Update state incrementally to show progress
        setSessionImages((prev) => ({ ...prev, ...imageMap }));
      }
      return imageMap;
    },
    [getDisplayImage]
  );

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error("Network error: Failed to connect to the server");
        }

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0].message || "Failed to fetch sessions");
        }

        const fetchedSessions = result.data.getSessions || [];
        setSessions(fetchedSessions);

        // Fetch images in batches
        await fetchImagesInBatches(fetchedSessions);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toast.error(errorMessage, {});
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [fetchImagesInBatches, query]);

  // Debounced resize handler
  useEffect(() => {
    if (typeof window !== "undefined") {
      let timeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const mobile = window.innerWidth < 768;
          setIsMobile(mobile);
          setSideBarOpen(!mobile);
        }, 100); // 100ms debounce
      };

      setIsMobile(window.innerWidth < 768);
      setSideBarOpen(window.innerWidth >= 768);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeout);
      };
    }
  }, [setSideBarOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const cleanTitle = (title: string): string => {
    try {
      const parsed = JSON.parse(title);
      return typeof parsed === "object" && parsed.title ? parsed.title : title;
    } catch {
      return title.replace(/[{}\[\]"]/g, "").trim();
    }
  };

  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-64 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center">
      <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-gray-700 animate-pulse" />
      <div className="relative mt-2 z-10">
        <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );

  const handleSessionClick = (session: Session) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("topicUrl", session.url || "");
      sessionStorage.setItem("topicId", session.id || "");
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      {sideBarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${
          sideBarOpen && !isMobile ? "ml-72" : "ml-0"
        } transition-all duration-300 flex flex-col`}
      >
        <header className="w-full bg-[#171717] p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {(!sideBarOpen || isMobile) && (
              <button
                className="text-gray-400"
                onClick={() => setSideBarOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            {!sideBarOpen && (
              <Image
                src="/cloudnotte-logo.png"
                alt="Logo"
                width={150}
                height={150}
                className="hidden md:block"
              />
            )}
          </div>
        </header>
        <div className={`md:mt-16 lg:mt-16 ${!sideBarOpen ? "pl-5" : ""}`}>
          <div className="text-3xl">History</div>
          <hr
            className={`border-t border-gray-700 mt-5 ${
              !sideBarOpen ? "md:w-[79rem]" : "md:w-[65rem]"
            }`}
          />
        </div>
        <div
          className={`${
            !sideBarOpen ? "ml-20" : ""
          } grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-4 mt-6`}
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
            <div className="col-span-full text-center text-red-500">
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">
              No sessions found.
            </div>
          ) : (
            sessions.map((session) => (
              <Link
                key={session.id}
                href={{
                  pathname: "/content",
                  query: {
                    url: session.url || "",
                    id: session.id || "",
                  },
                }}
                onClick={() => handleSessionClick(session)}
              >
                <div className="flex-shrink-0 w-64 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={sessionImages[session.id]?.imageUrl || "/fallback.png"}
                      alt={`Session ${session.title}`}
                      layout="fill"
                      objectFit={sessionImages[session.id]?.isPdf ? "contain" : "cover"}
                      className="rounded-lg transition-transform duration-300 hover:scale-105"
                      loading="lazy" // Enable lazy loading
                      onError={(e) => {
                        e.currentTarget.src = "/fallback.png";
                      }}
                    />
                  </div>
                  <div className="relative mt-2 z-10">
                    <h3 className="text-md font-semibold text-white truncate">
                      {cleanTitle(session.title)}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}