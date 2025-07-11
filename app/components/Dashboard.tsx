"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import UploadInput from "../components/Dashboard/Upload";
import PasteInput from "../components/Dashboard/Paste";
import RecordInput from "../components/Dashboard/Record";
import KeepLearning from "../components/Dashboard/KeepLearning";
import ExploreTopics from "../components/Dashboard/ExploreTopics";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import router from "next/router";

// const sanitizeString = (str: string): string => {
//   return str.replace(/[<>"'&]/g, (char) => ({
//     '<': '<',
//     '>': '>',
//     '"': '"',
//     "'": ''',
//     '&': '&'
//   }[char] || char));
// };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const hasShownToast = useRef<boolean>(false);
  const hasFetched = useRef<boolean>(false);
  const { sideBarOpen, setSideBarOpen, theme } = useAppContext();
  const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [submittedContent, setSubmittedContent] = useState<
    { type: string; value: string }[]
  >([]);

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
  const getUsernameFromToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      return storedUsername;
    }

    const token = localStorage.getItem("Token");
    if (!token) {
      console.warn("No JWT token found in localStorage under 'Token'");
      return null;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded.username) {
        console.warn("No 'username' field found in JWT payload");
        return null;
      }
      localStorage.setItem("username", decoded.username);
      return decoded.username;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }, []);

  const isValidUrl = useCallback((string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

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

  useEffect(() => {
    const fetchSessions = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const username = getUsernameFromToken();
      if (!username) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          setError("Please log in to view sessions.");
          toast.error("Authentication required. Please log in.");
          setLoading(false);
          router.push("/login");
        }
        return;
      }

      try {
        const token = localStorage.getItem("Token");
        const queryBody = JSON.stringify({ query, variables: { username } });
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
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL error");
        }

        const fetchedSessions: Session[] = result.data?.getSessions || [];
        setSessions(fetchedSessions);
        await fetchImagesInBatches(fetchedSessions);
      } catch (err: unknown) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
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
  }, );

  const getDisplayImage = useCallback(
    async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
      if (!url || !isValidUrl(url)) {
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      setSideBarOpen(window.innerWidth >= 768);

      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile !== isMobile) {
          setSideBarOpen(!mobile);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isMobile, setSideBarOpen]);

  return (
    <div
      className={`flex min-h-screen overflow-x-hidden ${
        theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'
      }`}
    >
      {sideBarOpen && isMobile && (
        <div
          className={`fixed inset-0 bg-opacity-50 z-10 ${
            theme === 'dark' ? 'bg-black' : 'bg-gray-500'
          }`}
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${
          sideBarOpen && !isMobile ? "ml-64" : "ml-0"
        } transition-all duration-300 flex flex-col w-full box-border`}
      >
        <div
          className={`w-full border-b p-4 flex items-center justify-between sticky top-0 z-10 ${
            theme === 'dark' ? 'bg-[#121212] border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-8">
            {/* Menu button for mobile */}
            {isMobile && (
              <button
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
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
            {/* Logo */}
            <Image
              src="/cloudnotte-logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="object-contain max-w-[100px] sm:max-w-[120px] h-auto"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 mt-10 sm:mt-16 lg:mt-20">
          <h1 className="text-xl sm:text-2xl lg:text-[30px] font-medium mb-6 text-center">
            What do you want to learn today?
          </h1>
          <div className="max-w-5xl md:max-w-xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto">
              <UploadInput
                setSubmittedContent={setSubmittedContent}
                setNewSession={async ({ session }: { session: Session }) => {
                  setSessions((prev) => {
                    const existingIndex = prev.findIndex((s) => s.id === session.id);
                    if (existingIndex !== -1) {
                      const updated = [...prev];
                      updated.splice(existingIndex, 1);
                      return [session, ...updated];
                    }
                    return [session, ...prev];
                  });

                  await fetchImagesInBatches([session]);

                  console.log("New session added or updated:", session);
                }}
              />
              <PasteInput setSubmittedContent={setSubmittedContent} setNewSession={async ({ session }: { session: Session }) => {
                  setSessions((prev) => {
                    const existingIndex = prev.findIndex((s) => s.id === session.id);
                    if (existingIndex !== -1) {
                      const updated = [...prev];
                      updated.splice(existingIndex, 1);
                      return [session, ...updated];
                    }
                    return [session, ...prev];
                  });

                  await fetchImagesInBatches([session]);

                  console.log("New session added or updated:", session);
                }}/>
              <RecordInput
                setSubmittedContent={setSubmittedContent}
                setNewSession={async ({ session }: { session: Session }) => {
                  setSessions((prev) => {
                    const existingIndex = prev.findIndex((s) => s.id === session.id);
                    if (existingIndex !== -1) {
                      const updated = [...prev];
                      updated.splice(existingIndex, 1);
                      return [session, ...updated];
                    }
                    return [session, ...prev];
                  });

                  await fetchImagesInBatches([session]);

                  console.log("New session added or updated:", session);
                }} />
            </div>
          </div>

          {submittedContent.length > 0 && (
            <div className="max-w-xl mx-auto mb-8 sm:mb-12 lg:mb-16 px-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-4">
                Your Content
              </h2>
              <div className="space-y-4">
                {submittedContent.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}
                  >
                    <h3
                      className={`text-sm sm:text-base lg:text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                    >
                      {item.type}
                    </h3>
                    {item.type === "URL" ? (
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline break-all text-xs sm:text-sm lg:text-base ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p
                        className={`break-words text-xs sm:text-sm lg:text-base ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <KeepLearning
            loading={loading}
            error={error ?? ""}
            sessionImages={sessionImages}
            sessions={sessions}
            setSessions={setSessions}
          />

          <ExploreTopics />
        </div>
      </div>
    </div>
  );
}