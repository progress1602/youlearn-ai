// components/KeepLearning.tsx
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getSessionsQuery } from "@/app/api/graphql/querys/literals/url";
import { useUrl } from "@/context/AppContext";
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
  const { setUrl, setSessonId } = useUrl();
  // Function to determine the display image based on URL extension
  const getDisplayImage = (url: string): string => {
    if (!url) return "/fallback.png";

    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "/pdf.png";
      case "mp3":
        return "/mp3.jpg";
      case "mp4":
      case "m4v":
      case "webm":
      case "ogg":
      case "m4a":
        return "/recorder.png";
      default:
        return "/fallback.png";
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
        
        // Show success toast
        toast.success(
          fetchedSessions.length > 0
            ? "Successfully loaded sessions!"
            : "No sessions found."
        );
      } catch (err: unknown) {
        // Show error toast
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

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
            <Link key={session.id} href={`/content/`} onClick={() => { if (setUrl) setUrl(session.url || "");  if (setSessonId) setSessonId(session.id || "");}}>
              <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
                <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                  <Image
                    src={getDisplayImage(session.url)}
                    alt={`Session ${session.id}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-sm sm:text-sm font-semibold text-white">
                    {session.title}
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