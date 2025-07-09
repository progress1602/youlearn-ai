"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { jwtDecode } from "jwt-decode";
import { useAppContext } from "@/context/AppContext";

// Utility to sanitize strings for XSS prevention
// const sanitizeString = (str: string): string => {
//   return str.replace(/[<>"'&]/g, (char) => ({
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#x27;',
//     '&': '&amp;'
//   }[char] || char));
// };

const sanitizeString = (str?: string): string => {
  if (typeof str !== "string") return "";
  return str.replace(/[<>"'&]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
  }[char]!));
};


const API_URL = process.env.NEXT_PUBLIC_API_URL || "";



// interface JWTPayload {
//   username?: string;
//   [key: string]: string | number | boolean | null | undefined;
// }

export default function KeepLearning({loading, error, sessionImages, sessions, setSessions}:{loading: boolean; error: string;sessionImages:{ [key: string]: { imageUrl: string; isPdf: boolean } }; sessions: Session[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>;} ) {
  const { theme } = useAppContext();
  // const [sessions, setSessions] = useState<Session[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [thumbnailCache, setThumbnailCache] = useState<{ [key: string]: string }>({});
  // const [sessionImages, setSessionImages] = useState<{ [key: string]: { imageUrl: string; isPdf: boolean } }>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; username: string } | null>(null);
  // const hasShownToast = useRef<boolean>(false);
  // const hasFetched = useRef<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // const router = useRouter();

  // Load cached thumbnails from localStorage on mount
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const cached = localStorage.getItem("thumbnailCache");
  //     if (cached) {
  //       try {
  //         setThumbnailCache(JSON.parse(cached));
  //       } catch (e) {
  //         console.error("Failed to parse thumbnail cache:", e);
  //       }
  //     }
  //   }
  // }, []);

  // // Save thumbnail cache to localStorage whenever it updates
  // useEffect(() => {
  //   if (Object.keys(thumbnailCache).length > 0 && typeof window !== "undefined") {
  //     localStorage.setItem("thumbnailCache", JSON.stringify(thumbnailCache));
  //   }
  // }, [thumbnailCache]);

  // // GraphQL query with username variable
  // const query = `
  //   query GetSessions($username: String!) {
  //     getSessions(username: $username) {
  //       id
  //       url
  //       username
  //       title
  //       createdAt
  //       fileType
  //     }
  //   }
  // `;

  // Function to extract username from JWT and save to localStorage
  // const getUsernameFromToken = useCallback((): string | null => {
  //   if (typeof window === "undefined") return null;

  //   const storedUsername = localStorage.getItem("username");
  //   if (storedUsername) {
  //     return storedUsername;
  //   }

  //   const token = localStorage.getItem("Token");
  //   if (!token) {
  //     console.warn("No JWT token found in localStorage under 'Token'");
  //     return null;
  //   }

  //   try {
  //     const decoded = jwtDecode<JWTPayload>(token);
  //     if (!decoded.username) {
  //       console.warn("No 'username' field found in JWT payload");
  //       return null;
  //     }
  //     localStorage.setItem("username", decoded.username);
  //     return decoded.username;
  //   } catch (error) {
  //     console.error("Error decoding JWT:", error);
  //     return null;
  //   }
  // }, []);

  // // Function to check if a string is a valid URL
  // const isValidUrl = useCallback((string: string): boolean => {
  //   try {
  //     new URL(string);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // }, []);

  // // Function to extract YouTube video ID from URL
  // const getYouTubeVideoId = useCallback((url: string): string | null => {
  //   const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  //   const match = url.match(regex);
  //   return match ? match[1] : null;
  // }, []);

  // // Function to clean session title
  const cleanTitle = useCallback((title: string): string => {
    try {
      const parsed = JSON.parse(title);
      return typeof parsed === "object" && parsed.title ? sanitizeString(parsed.title) : sanitizeString((title ?? "").replace(/[{}\[\]"]/g, "").trim());
    } catch {
      return sanitizeString((title ?? "").replace(/[{}\[\]"]/g, "").trim());
    }
  }, []);

  // // Function to validate hostname against allowed patterns
  // const isValidHostname = useCallback((url: string): boolean => {
  //   try {
  //     const { hostname } = new URL(url);
  //     const allowedPatterns = [
  //       "img.tiktok.com",
  //       /\.tiktokcdn\.com$/,
  //       /\.tiktokcdn-us\.com$/,
  //     ];
  //     return allowedPatterns.some((pattern) =>
  //       typeof pattern === "string" ? hostname === pattern : pattern.test(hostname)
  //     );
  //   } catch {
  //     return false;
  //   }
  // }, []);

  // // Function to fetch TikTok thumbnail using oEmbed API
  // const getTikTokThumbnail = useCallback(
  //   async (url: string): Promise<string> => {
  //     if (thumbnailCache[url]) {
  //       return thumbnailCache[url];
  //     }
  //     try {
  //       const controller = new AbortController();
  //       const timeoutId = setTimeout(() => controller.abort(), 3000);
  //       const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
  //         signal: controller.signal,
  //       });
  //       clearTimeout(timeoutId);

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch TikTok thumbnail");
  //       }
  //       const data = await response.json();
  //       const thumbnailUrl = data.thumbnail_url || "/fallback.png";
  //       if (!isValidHostname(thumbnailUrl)) {
  //         console.warn(`Invalid hostname for TikTok thumbnail: ${thumbnailUrl}`);
  //         return "/fallback.png";
  //       }
  //       setThumbnailCache((prev) => ({ ...prev, [url]: thumbnailUrl }));
  //       return thumbnailUrl;
  //     } catch (error) {
  //       console.error("Error fetching TikTok thumbnail:", error);
  //       return "/fallback.png";
  //     }
  //   },
  //   [isValidHostname, thumbnailCache]
  // );

  // // Function to extract file extension from URL
  // const getFileExtension = useCallback((url: string): string | null => {
  //   try {
  //     const { pathname } = new URL(url);
  //     const filename = pathname.split("/").pop();
  //     if (!filename) return null;
  //     const parts = filename.split(".");
  //     if (parts.length < 2) return null;
  //     return parts.pop()?.toLowerCase() || null;
  //   } catch (error) {
  //     console.warn(`Failed to parse URL for extension: ${url}`, error);
  //     return null;
  //   }
  // }, []);

  // // Function to determine the display image based on URL
  // const getDisplayImage = useCallback(
  //   async (url: string): Promise<{ imageUrl: string; isPdf: boolean }> => {
  //     if (!url || !isValidUrl(url)) {
  //       return { imageUrl: "/text.webp", isPdf: false };
  //     }

  //     const youtubeId = getYouTubeVideoId(url);
  //     if (youtubeId) {
  //       return { imageUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`, isPdf: false };
  //     }

  //     if (url.includes("tiktok.com")) {
  //       const thumbnailUrl = await getTikTokThumbnail(url);
  //       return { imageUrl: thumbnailUrl, isPdf: false };
  //     }

  //     const extension = getFileExtension(url);
  //     switch (extension) {
  //       case "pdf":
  //         return { imageUrl: "/pdf.png", isPdf: true };
  //       case "mp3":
  //         return { imageUrl: "/mp3.jpg", isPdf: false };
  //       case "mp4":
  //       case "m4v":
  //       case "webm":
  //       case "ogg":
  //       case "m4a":
  //       case "wav":
  //         return { imageUrl: "/recorder.png", isPdf: false };
  //       default:
  //         console.warn(`No matching extension for URL: ${url}`);
  //         return { imageUrl: "/text.webp", isPdf: false };
  //     }
  //   },
  //   [getYouTubeVideoId, getTikTokThumbnail, getFileExtension, isValidUrl]
  // );

  // // Function to fetch images in batches
  // const fetchImagesInBatches = useCallback(
  //   async (sessions: Session[], batchSize: number = 5) => {
  //     const imageMap: { [key: string]: { imageUrl: string; isPdf: boolean } } = {};
  //     for (let i = 0; i < sessions.length; i += batchSize) {
  //       const batch = sessions.slice(i, i + batchSize);
  //       const imagePromises = batch.map(async (session) => {
  //         const { imageUrl, isPdf } = await getDisplayImage(session.url);
  //         return { id: session.id, imageUrl, isPdf };
  //       });
  //       const images = await Promise.all(imagePromises);
  //       images.forEach(({ id, imageUrl, isPdf }) => {
  //         imageMap[id] = { imageUrl, isPdf };
  //       });
  //       setSessionImages((prev) => ({ ...prev, ...imageMap }));
  //     }
  //     return imageMap;
  //   },
  //   [getDisplayImage]
  // );

  // Function to handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    const { id, username } = sessionToDelete;
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

      // setSessions(({prev}: {prev: Session[]}) => prev.filter((session) => session.id !== id));
      setSessions((prev) => prev.filter((session) => session.id !== id));

      toast.success("Session deleted successfully");
      setIsModalOpen(false);
      setSessionToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete session";
      toast.error(errorMessage);
      setIsModalOpen(false);
      setSessionToDelete(null);
    }
  };

  // Function to open modal
  const openDeleteModal = useCallback((id: string, username: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSessionToDelete({ id, username });
    setIsModalOpen(true);
  }, []);

  // Function to close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSessionToDelete(null);
  }, []);

  // Focus trap for modal accessibility
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === "Escape") {
          closeModal();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen, closeModal]);

  // Fetch sessions
  // useEffect(() => {
  //   const fetchSessions = async () => {
  //     if (hasFetched.current) return;
  //     hasFetched.current = true;

  //     const username = getUsernameFromToken();
  //     if (!username) {
  //       if (!hasShownToast.current) {
  //         hasShownToast.current = true;
  //         setError("Please log in to view sessions.");
  //         toast.error("Authentication required. Please log in.");
  //         setLoading(false);
  //         router.push("/login");
  //       }
  //       return;
  //     }

  //     try {
  //       const token = localStorage.getItem("Token");
  //       const queryBody = JSON.stringify({ query, variables: { username } });
  //       const response = await fetch(API_URL, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           ...(token && { Authorization: `Bearer ${token}` }),
  //         },
  //         body: queryBody,
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch sessions: ${response.status}`);
  //       }

  //       const result = await response.json();
  //       if (result.errors) {
  //         throw new Error(result.errors[0]?.message || "GraphQL error");
  //       }

  //       const fetchedSessions: Session[] = result.data?.getSessions || [];
  //       setSessions(fetchedSessions);
  //       await fetchImagesInBatches(fetchedSessions);
  //     } catch (err: unknown) {
  //       if (!hasShownToast.current) {
  //         hasShownToast.current = true;
  //         const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
  //         setError(errorMessage);
  //         toast.error(errorMessage);
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSessions();

  //   return () => {
  //     hasShownToast.current = false;
  //   };
  // }, [getUsernameFromToken, router, fetchImagesInBatches, query]);

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div
      className={`flex-shrink-0 w-52 sm:w-60 border rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center animate-pulse ${
        theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className={`relative w-full h-24 sm:h-28 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
      <div className="mt-3">
        <div className={`h-5 rounded w-3/4 mb-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
        <div className={`h-4 rounded w-1/2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
      </div>
    </div>
  );

  // Function to format date
  const formatDate = (dateString: string): string => {
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
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Keep learning
        </h2>
        <Link href="/history">
          <h2
            className={`text-sm sm:text-base hover:underline ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View all
          </h2>
        </Link>
      </div>
      {error ? (
        <div
          className={`text-center ${theme === "dark" ? "text-red-400" : "text-red-600"}`}
        >
          {sanitizeString(error)}
        </div>
      ) : (
        <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory hide-scrollbar">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
          ) : sessions.length === 0 ? (
            <div
              className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
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
                      theme === "dark" ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-300"
                    }`}
                  >
                    <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                      <Image
                        src={sessionImages[session.id]?.imageUrl || "/text.webp"}
                        alt={`Session ${sanitizeString(session.title)}`}
                        fill
                        style={{
                          objectFit: sessionImages[session.id]?.isPdf ? "contain" : "cover",
                        }}
                        className="rounded-lg transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.warn(
                            `Image failed to load for session ${session.id}: ${sessionImages[session.id]?.imageUrl}`
                          );
                          e.currentTarget.src = "/text.webp";
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <h3
                        className={`text-sm sm:text-sm font-semibold truncate ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                        title={sanitizeString(cleanTitle(session.title))}
                      >
                        {sanitizeString(cleanTitle(session.title))}
                      </h3>
                      <p
                        className={`text-sm sm:text-sm flex items-center justify-between ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {formatDate(session.createdAt)}
                        <button
                          aria-label={`Delete session ${sanitizeString(cleanTitle(session.title))}`}
                          onClick={(e) => openDeleteModal(session.id, session.username, e)}
                        >
                          <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" />
                        </button>
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
      {isModalOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50  bg-opacity-50 backdrop-blur-md transition-opacity duration-300`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm session deletion"
        >
          <div
            className={`relative rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all duration-500 ${
              theme === "dark" ? "bg-[#2a2a2a] text-white" : "bg-white text-black"
            }`}
            ref={modalRef}
            tabIndex={-1}
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-sm mb-6">
              Are you certain you want to delete this session? This action is permanent.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm ${
                  theme === "dark"
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                aria-label="Confirm deletion"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}