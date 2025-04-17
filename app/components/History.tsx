"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  interface Session {
    id: string;
    url: string;
    userId: string;
    title: string;
    createdAt: string;
  }

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Updated GraphQL query
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

  // Fetch sessions using fetch
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

        setSessions(result.data.getSessions || []);
        toast.success("Sessions loaded successfully!", {});
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          if (err.message.includes("Network error")) {
            toast.error("Network Error: Unable to connect to the server!", {});
          } else {
            toast.error(`${err.message}`, {});
          }
        } else {
          setError("An unknown error occurred");
          toast.error("An unknown error occurred!", {});
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [query]);

  // Handle window resize for mobile detection
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

  // Function to determine image source based on file extension
  const getImageSrc = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith(".wav") || lowerUrl.endsWith(".m4a")) return "/recorder.png";
    if (lowerUrl.endsWith(".pdf")) return "/pdf.png";
    if (lowerUrl.endsWith(".mp3")) return "/mp3.jpg";
    return "/pdf.png"; // Fallback to pdf.png for unsupported types
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-64 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center">
      <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden bg-gray-700 animate-pulse" />
      <div className="relative mt-2 z-10">
        <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );

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
            !sideBarOpen ? "ml-10" : ""
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
              <div
                key={session.id}
                className="flex-shrink-0 w-64 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300"
              >
                <Link key={session.id} href={`/content/${session.id}`}>
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={getImageSrc(session.url) || "/pdf.png"}
                      alt={`Session ${session.title}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="relative mt-2 z-10">
                    <h3 className="text-md font-semibold text-white truncate">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}