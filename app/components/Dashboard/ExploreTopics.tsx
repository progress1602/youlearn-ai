"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ExploreTopics() {
  const { theme } = useAppContext();

  interface Topic {
    id: string;
    url: string;
    status: string;
    username: string;
    title: string;
    fileType: string;
    createdAt: string;
    updatedAt: string;
  }

  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topicImages, setTopicImages] = useState<Record<string, { imageUrl: string; isPdf: boolean }>>({});
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const hasShownToast = useRef(false);
  const hasFetched = useRef(false); // New ref to prevent double fetch

  // Default fallback image
  const FALLBACK_IMAGE = "/text.webp";

  // Load cached thumbnails from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("exploreThumbnailCache");
      if (cached) {
        setThumbnailCache(JSON.parse(cached));
      }
    }
  }, []);

  // Save thumbnail cache to localStorage whenever it updates
  useEffect(() => {
    if (Object.keys(thumbnailCache).length > 0 && typeof window !== "undefined") {
      localStorage.setItem("exploreThumbnailCache", JSON.stringify(thumbnailCache));
    }
  }, [thumbnailCache]);

  // Function to check if a string is a valid URL
  const isValidUrl = useCallback((string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Function to extract file extension from URL
  const getFileExtension = useCallback((url: string) => {
    try {
      const { pathname } = new URL(url);
      const filename = pathname.split("/").pop();
      if (!filename) return null;
      const parts = filename.split(".");
      if (parts.length < 2) return null;
      return parts.pop()?.toLowerCase() || null;
    } catch {
      return null;
    }
  }, []);

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = useCallback((url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  // Function to validate hostname against allowed patterns
  const isValidHostname = useCallback((url: string) => {
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

  // Function to fetch TikTok thumbnail using oEmbed API
  const getTikTokThumbnail = useCallback(
    async (url: string) => {
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
        const thumbnailUrl = data.thumbnail_url || FALLBACK_IMAGE;
        if (!isValidHostname(thumbnailUrl)) {
          return FALLBACK_IMAGE;
        }
        setThumbnailCache((prev) => ({ ...prev, [url]: thumbnailUrl }));
        return thumbnailUrl;
      } catch {
        return FALLBACK_IMAGE;
      }
    },
    [isValidHostname, thumbnailCache, FALLBACK_IMAGE]
  );

  // Function to determine the display image based on URL and fileType
  const getDisplayImage = useCallback(
    async (url: string, fileType: string) => {
      if (!url || !isValidUrl(url)) {
        return { imageUrl: FALLBACK_IMAGE, isPdf: false };
      }

      const youtubeId = getYouTubeVideoId(url);
      if (youtubeId) {
        return { imageUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, isPdf: false };
      }

      if (url.includes("tiktok.com")) {
        const thumbnailUrl = await getTikTokThumbnail(url);
        return { imageUrl: thumbnailUrl, isPdf: false };
      }

      const extension = getFileExtension(url) || fileType?.toLowerCase();
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
          return { imageUrl: FALLBACK_IMAGE, isPdf: false };
      }
    },
    [getYouTubeVideoId, getTikTokThumbnail, getFileExtension, isValidUrl, FALLBACK_IMAGE]
  );

  // Function to fetch images in batches
  const fetchImagesInBatches = useCallback(
    async (topics: Topic[], batchSize = 5) => {
      const imageMap: Record<string, { imageUrl: string; isPdf: boolean }> = {};
      for (let i = 0; i < topics.length; i += batchSize) {
        const batch = topics.slice(i, i + batchSize);
        const imagePromises = batch.map(async (topic) => {
          const { imageUrl, isPdf } = await getDisplayImage(topic.url, topic.fileType);
          return { id: topic.id, imageUrl, isPdf };
        });
        const images = await Promise.all(imagePromises);
        images.forEach(({ id, imageUrl, isPdf }) => {
          imageMap[id] = { imageUrl, isPdf };
        });
      }
      setTopicImages(imageMap);
    },
    [getDisplayImage]
  );

  useEffect(() => {
    const fetchTopics = async () => {
      // Prevent fetching if already fetched
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        setIsLoading(true);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query getExploreTopics {
                getExploreTopics {
                  id
                  url
                  status
                  username
                  title
                  fileType
                  createdAt
                  updatedAt
                }
              }
            `,
          }),
        });

        const { data, errors } = await response.json();
        if (errors) {
          throw new Error(errors[0]?.message || "Failed to fetch topics");
        }
        const fetchedTopics = data.getExploreTopics || [];
        setTopics(fetchedTopics);
        if (fetchedTopics.length > 0) {
          await fetchImagesInBatches(fetchedTopics);
        }
      } catch (err) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();

    return () => {
      hasShownToast.current = false;
    };
  }, [fetchImagesInBatches]);

  if (error) {
    return (
      <div className={`text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl mt-6 sm:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-lg sm:text-xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}
        >
          Explore topics
        </h2>
        <Link href="">
          <h2
            className={`text-sm sm:text-base hover:underline ${
              theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Close all
          </h2>
        </Link>
      </div>
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
        {isLoading ? (
          // Skeleton Loader
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-52 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center animate-pulse ${
                theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-gray-100 border-gray-300"
              }`}
            >
              <div
                className={`w-full h-24 sm:h-28 rounded-lg ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                } animate-pulse`}
              />
              <div className="mt-3 space-y-2">
                <div
                  className={`h-5 rounded w-3/4 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
                <div
                  className={`h-4 rounded w-1/2 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  } animate-pulse`}
                />
              </div>
            </div>
          ))
        ) : topics.length === 0 ? (
          <p className={`text-center w-full ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            No topics found.
          </p>
        ) : (
          topics.map((topic) => (
            <Link
              key={topic.id}
              href={{
                pathname: "/content",
                query: {
                  url: topic.url || "",
                  id: topic.id || "",
                  fileType: topic.fileType || "",
                },
              }}
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("topicUrl", topic.url || "");
                  sessionStorage.setItem("topicId", topic.id || "");
                  sessionStorage.setItem("fileType", topic.fileType || "");
                }
              }}
            >
              <div
                className={`flex-shrink-0 w-52 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300 ${
                  theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"
                }`}
              >
                <div className="relative w-full h-24 sm:h-28 rounded-lg overhang-hidden">
                  <Image
                    src={topicImages[topic.id]?.imageUrl || FALLBACK_IMAGE}
                    alt={topic.title || "Topic"}
                    fill
                    style={{
                      objectFit: topicImages[topic.id]?.isPdf ? "contain" : "cover",
                    }}
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI/wN4QjMtmAAAAABJRU5ErkJggg=="
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="mt-3">
                  <h3
                    className={`text-base sm:text-sm font-semibold ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {format(new Date(topic.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}