import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useUrl } from "@/context/AppContext";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ExploreTopics() {
  const [topics, setTopics] = useState<
    { id: string; url?: string; status: string; userId: string; createdAt: string; updatedAt: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setUrl, setSessonId} = useUrl();
  useEffect(() => {
    const fetchTopics = async () => {
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
                  userId
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
        setTopics(data.getExploreTopics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const getImageSource = (url?: string) => {
    if (!url) return null;
    const extension = url.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "/pdf.png";
      case "mp3":
        return "/mp3.jpg";
      case "wav": // Assuming recordings might be wav
      case "m4a": // or m4a
        return "/recorder.png";
      default:
        return null;
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="mx-auto max-w-[24.9rem] sm:max-w-5xl mt-6 sm:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Explore topics</h2>
        <Link href="/">
          <h2 className="text-sm sm:text-base text-gray-400 hover:text-white">
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
              className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center"
            >
              <div className="w-full h-24 sm:h-28 rounded-lg bg-gray-700 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          topics.map((topic) => {
            const imageSrc = getImageSource(topic.url);
            if (!imageSrc) return null; // Skip rendering if no valid image source

            return (
              <Link key={topic.id} href={ "/content"} onClick={() => { if (setUrl) setUrl(topic.url || ""); if (setSessonId) setSessonId(topic.id || ""); }}>
                <div className="flex-shrink-0 w-52 sm:w-60 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 h-48 sm:h-56 flex flex-col justify-between snap-center hover:shadow-xl transition-all duration-300">
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt="Topic"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {/* Topic */}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {format(new Date(topic.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}