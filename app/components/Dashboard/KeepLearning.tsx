import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react"; // Add useRef
import { toast } from "react-toastify";
import { getSessionsQuery } from "@/app/api/graphql/querys/literals/url";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Session {
  id: string;
  url: string;
  userId: string;
  title: string;
  createdAt: string;
}

export default function KeepLearning() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({});
  const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({});
  const hasShownToast = useRef(false); // Track if toast has been shown

  // Function to check if a string is a valid URL
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const cleanTitle = (title: string): string => {
    try {
      const parsed = JSON.parse(title);
      return typeof parsed === "object" && parsed.title ? parsed.title : title;
    } catch {
      return title.replace(/[{}\[\]"]/g, "").trim();
    }
  };

  // Function to validate hostname against allowed patterns
  const isValidHostname = (url: string): boolean => {
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
  };

  // Function to fetch TikTok thumbnail using oEmbed API
  const getTikTokThumbnail = async (url: string): Promise<string> => {
    try {
      if (thumbnailCache[url]) {
        return thumbnailCache[url];
      }
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
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
  };

  // Function to extract file extension from URL
  const getFileExtension = (url: string): string | null => {
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
  };

  // Function to determine the display image based on URL
  const getDisplayImage = async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
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
        return { imageUrl: "/recorder.png", isPdf: false };
      default:
        console.warn(`No matching extension for URL: ${url}`);
        return { imageUrl: "/fallback.png", isPdf: false };
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: getSessionsQuery,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.status}`);
        }

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL error");
        }

        const fetchedSessions = result.data?.getSessions || [];
        setSessions(fetchedSessions);

        // Fetch images for each session
        const imagePromises = fetchedSessions.map(async (session: Session) => {
          const { imageUrl, isPdf } = await getDisplayImage(session.url);
          return { id: session.id, imageUrl, isPdf };
        });
        const images = await Promise.all(imagePromises);
        const imageMap = images.reduce((acc, { id, imageUrl, isPdf }) => {
          acc[id] = { imageUrl, isPdf };
          return acc;
        }, {} as { [key: string]: { imageUrl: string; isPdf: boolean } });
        setSessionImages(imageMap);

        // Show toast only if it hasn't been shown yet
        // if (!hasShownToast.current && fetchedSessions.length > 0) {
        //   hasShownToast.current = true;
        //   toast.success("Successfully loaded sessions!");
        // }
      } catch (err: unknown) {
        // Show error toast only if it hasn't been shown yet
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          const errorMessage =
            err instanceof Error ? err.message : "An unexpected error occurred";
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Reset toast flag on component unmount
    return () => {
      hasShownToast.current = false;
    };
  }, ); // Empty dependency array ensures useEffect runs once on mount

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center animate-pulse">
      <div className="relative w-full h-24 sm:h-28 rounded-lg bg-gray-700"></div>
      <div className="mt-3">
        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
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
        <h2 className="text-lg sm:text-xl font-semibold">Keep learning</h2>
        <Link href="/history">
          <h2 className="text-sm sm:text-base text-gray-400 hover:text-white">
            View all
          </h2>
        </Link>
      </div>
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
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
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("topicUrl", session.url || "");
                  sessionStorage.setItem("topicId", session.id || "");
                }
              }}
            >
              <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                  <Image
                    src={sessionImages[session.id]?.imageUrl || "/text.webp"}
                    alt={`Session ${session.id}`}
                    layout="fill"
                    objectFit={sessionImages[session.id]?.isPdf ? "contain" : "cover"}
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      console.warn(`Image failed to load for session ${session.id}: ${sessionImages[session.id]?.imageUrl}`);
                      e.currentTarget.src = "/text.webp";
                    }}
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-sm sm:text-sm font-semibold text-white">
                    {cleanTitle(session.title)}
                  </h3>
                  <p className="text-sm sm:text-sm text-gray-400">
                    {formatDate(session.createdAt)}
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