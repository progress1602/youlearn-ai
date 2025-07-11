"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";

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


export default function KeepLearning({loading, error, sessionImages, sessions, setSessions}:{loading: boolean; error: string;sessionImages:{ [key: string]: { imageUrl: string; isPdf: boolean } }; sessions: Session[]; setSessions: React.Dispatch<React.SetStateAction<Session[]>>;} ) {
  const { theme } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; username: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // // Function to clean session title
  const cleanTitle = useCallback((title: string): string => {
    try {
      const parsed = JSON.parse(title);
      return typeof parsed === "object" && parsed.title ? sanitizeString(parsed.title) : sanitizeString((title ?? "").replace(/[{}\[\]"]/g, "").trim());
    } catch {
      return sanitizeString((title ?? "").replace(/[{}\[\]"]/g, "").trim());
    }
  }, []);

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