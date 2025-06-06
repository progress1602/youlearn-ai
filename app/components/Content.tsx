"use client";

import Head from "next/head";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronFirst, ChevronLast } from "lucide-react";
import { Chat } from "../components/Features/Chat";
import Summary from "../components/Features/Summary";
import { Flashcards } from "./Features/FlashCards";
import { Quiz } from "../components/Features/Quiz";
import { Chapters } from "../components/Features/Chapters";
import Transcripts from "../components/Features/Transcript";
import Notes from "./Features/Notes";
import FileViewer from "./file_viewer";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useRouter, useSearchParams } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ProcessedData {
  id: string;
  sessionId: string;
  extractedText: string;
}

interface Chat {
  id: string;
  question: string;
  content: string;
  createdAt: string;
}

interface Session {
  id?: string;
  userId?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  fileType?: string;
  status?: string;
  url?: string;
  processedData?: ProcessedData;
  chats?: Chat[];
}

interface Flashcard {
  id: number;
  question: string;
}

interface Chapter {
  title: string;
  summary: string;
  startTime: string;
  pageNumber: number;
}

type Option = {
  id: string;
  content: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  content: string;
  options: Option[];
  hint: string;
  explanation: string;
};

type QuizData = {
  id: string;
  sessionId: string;
  questions: Question[];
  createdAt: string;
};

export default function Home() {
  const { sideBarOpen, setSideBarOpen, theme } = useAppContext();
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Chat");
  const [session, setSession] = useState<Session>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetched = useRef(false); // Ref to prevent double fetch for session
  const hasFetchedSummary = useRef(false); // Ref to prevent double fetch for summary
  const hasFetchedFlashcards = useRef(false); // Ref to prevent double fetch for flashcards
  const hasFetchedQuiz = useRef(false); // Ref to prevent double fetch for quiz
  const hasFetchedChapters = useRef(false); // Ref to prevent double fetch for chapters
  const hasFetchedTranscripts = useRef(false); // Ref to prevent double fetch for transcripts
  const [content, setContent] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(true);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(true);
  const [transcriptsError, setTranscriptsError] = useState<string | null>(null);

  const urlFromQuery = searchParams.get("url") || sessionStorage.getItem("topicUrl");
  const textFromQuery = searchParams.get("fileType") || sessionStorage.getItem("fileType");
  const sessionId = searchParams.get("id") || sessionStorage.getItem("topicId");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchSummary = useCallback(async () => {
    if (hasFetchedSummary.current) return;
    hasFetchedSummary.current = true;
    try {
      setLoadingSummary(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetSummary($sessionId: ID!) {
              getSummary(sessionId: $sessionId) {
                content
              }
            }
          `,
          variables: { sessionId: sessionId ?? "" },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      setContent(result.data.getSummary.content);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingSummary(false);
    }
  }, [sessionId]);

  const refetchSummary = useCallback(() => {
    hasFetchedSummary.current = false;
    setContent(null);
    setLoadingSummary(true);
    setSummaryError(null);
    fetchSummary();
  }, [fetchSummary]);

  const fetchFlashcards = useCallback(async () => {
  if (hasFetchedFlashcards.current) return;
  hasFetchedFlashcards.current = true;
  try {
    setLoadingFlashcards(true);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query getQuestions($sessionId: ID!) {
            getQuestions(sessionId: $sessionId) {
              content
            }
          }
        `,
        variables: { sessionId: sessionId ?? "" },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const getQuestions = result.data?.getQuestions;
    if (!Array.isArray(getQuestions)) {
      throw new Error("Expected getQuestions to be an array");
    }

    const questions: string[] = getQuestions
      .filter((item): item is { content: string } => item && typeof item.content === "string")
      .map((item) => item.content);

    if (questions.length === 0) {
      throw new Error("No valid questions found in response");
    }

    const formattedFlashcards: Flashcard[] = questions.map((question, index) => ({
      id: index + 1,
      question,
    }));

    setFlashcards(formattedFlashcards);
  } catch (err) {
    setFlashcardsError(err instanceof Error ? err.message : "An error occurred");
  } finally {
    setLoadingFlashcards(false);
  }
}, [sessionId]);

  const refetchFlashcards = useCallback(() => {
    hasFetchedFlashcards.current = false;
    setFlashcards([]);
    setLoadingFlashcards(true);
    setFlashcardsError(null);
    fetchFlashcards();
  }, [fetchFlashcards]);

  const fetchQuiz = useCallback(async () => {
    if (hasFetchedQuiz.current) return;
    hasFetchedQuiz.current = true;
    try {
      setLoadingQuiz(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GenerateQuiz($sessionId: String!) {
              getQuiz(sessionId: $sessionId) {
                id
                sessionId
                questions {
                  id
                  content
                  options {
                    id
                    content
                    isCorrect
                  }
                  hint
                  explanation
                }
                createdAt
              }
            }
          `,
          variables: { sessionId: sessionId ?? "" },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      setQuizData(result.data.generateQuiz);
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : "Failed to fetch quiz data");
    } finally {
      setLoadingQuiz(false);
    }
  }, [sessionId]);

  const refetchQuiz = useCallback(() => {
    hasFetchedQuiz.current = false;
    setQuizData(null);
    setLoadingQuiz(true);
    setQuizError(null);
    fetchQuiz();
  }, [fetchQuiz]);

  const fetchChapters = useCallback(async () => {
    if (hasFetchedChapters.current) return;
    hasFetchedChapters.current = true;
    try {
      setLoadingChapters(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetChapters($sessionId: ID!) {
              getChapters(sessionId: $sessionId) {
                title
                summary
                startTime
                pageNumber
              }
            }
          `,
          variables: { sessionId: sessionId ?? "" },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to fetch chapters");
      }

      const chaptersData = result.data?.getChapters;
      if (Array.isArray(chaptersData)) {
        setChapters(chaptersData);
      } else if (typeof chaptersData === "string") {
        try {
          const parsedChapters = JSON.parse(chaptersData);
          if (Array.isArray(parsedChapters)) {
            setChapters(parsedChapters);
          } else {
            throw new Error("Parsed chapters data is not an array");
          }
        } catch {
          throw new Error("Chapters data is a string but not valid JSON");
        }
      } else {
        throw new Error("No valid chapters returned from the API");
      }
    } catch (err) {
      setChaptersError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingChapters(false);
    }
  }, [sessionId]);

  const refetchChapters = useCallback(() => {
    hasFetchedChapters.current = false;
    setChapters([]);
    setLoadingChapters(true);
    setChaptersError(null);
    fetchChapters();
  }, [fetchChapters]);

  const fetchTranscripts = useCallback(async () => {
    if (hasFetchedTranscripts.current) return;
    hasFetchedTranscripts.current = true;
    try {
      setLoadingTranscripts(true);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetTranscripts($sessionId: ID!) {
              getTranscripts(sessionId: $sessionId) {
                content
              }
            }
          `,
          variables: { sessionId: sessionId ?? "" },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to fetch transcripts");
      }

      if (!result.data?.getTranscripts) {
        throw new Error("No transcripts found for the given session ID");
      }

      const transcriptContents = result.data.getTranscripts.map((transcript: { content: string }) => transcript.content);
      setTranscripts(transcriptContents);
    } catch (err) {
      setTranscriptsError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingTranscripts(false);
    }
  }, [sessionId, API_URL]);

  const refetchTranscripts = useCallback(() => {
    hasFetchedTranscripts.current = false;
    setTranscripts([]);
    setLoadingTranscripts(true);
    setTranscriptsError(null);
    fetchTranscripts();
  }, [fetchTranscripts]);

  const fetchSessions = useCallback(async ({ id }: { id: string }) => {
    console.log("Fetching session with ID:", id);
    setLoading(true);

    const query = `
      query GetSession($id: ID!) {
        getSession(id: $id) {
          id
          url
          status
          fileType
          createdAt
          updatedAt
          processedData {
            id
            sessionId
            extractedText
          }
          title
          chats {
            id
            question
            content
            createdAt
          }
        }
      }
    `;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { id },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch sessions: ${errorText}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL error");
      }

      const fetchedSession = result.data?.getSession || {};
      setSession(fetchedSession);
    } catch (err: unknown) {
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      router.push("/app");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    console.log("Query params and session storage:", {
      urlFromQuery,
      textFromQuery,
      sessionId,
    });

    if (!urlFromQuery && textFromQuery !== "text") {
      console.warn("Redirecting to /app: No url or valid fileType", { urlFromQuery, textFromQuery });
      router.push("/app");
      return;
    }

    fetchSummary();
    fetchFlashcards();
    fetchQuiz();
    fetchChapters();
    fetchTranscripts();

    if (textFromQuery === "text" && sessionId) {
      fetchSessions({ id: sessionId });
    }

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
  }, [isMobile, setSideBarOpen, searchParams, router, urlFromQuery, textFromQuery, sessionId, fetchSummary, fetchFlashcards, fetchQuiz, fetchChapters, fetchTranscripts, fetchSessions]);

  const ContentViewer = useMemo(() => {
    if (textFromQuery === "text") {
      return loading ? (
        <h1 className="mt-60">Loading..</h1>
      ) : (
        <div className={`p-4 rounded-lg flex-1 overflow-y-auto ${theme === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"}`}>
          <pre className={`whitespace-pre-wrap ${theme === "dark" ? "text-white" : "text-black"}`}>
            {session?.processedData?.extractedText ?? session?.title ?? ""}
          </pre>
        </div>
      );
    }
    if (urlFromQuery) {
      return <FileViewer url={urlFromQuery} />;
    }
    return null;
  }, [textFromQuery, urlFromQuery, loading, session, theme]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#171717] text-white" : "bg-gray-100 text-black"}`}>
      <Head>
        <title>But what is a neural network?! | Deep learning chapter 1</title>
      </Head>

      {sideBarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSideBarOpen(false)}
        />
      )}

      <div
        className={`flex-1 ${sideBarOpen && !isMobile ? "ml-64" : "ml-0"} transition-all duration-300 flex flex-col`}
      >
        <header className={`w-full p-4 flex items-center justify-between sticky top-0 z-10 ${theme === "dark" ? "bg-[#171717]" : "bg-white"}`}>
          <div className="flex items-center gap-3">
            {(!sideBarOpen || isMobile) && (
              <button
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
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
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col md:flex-row space-x-0 md:space-x-1">
          {!isMobile && <div className="flex-1">{ContentViewer}</div>}
          {isMobile && chatOpen && <div className="flex-1">{ContentViewer}</div>}

          <div className={`hidden md:flex ${chatOpen ? "w-[35rem]" : "flex-1"}`}>
            <div className={`p-4 rounded-lg flex flex-col h-full transition-all duration-300 w-full ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
              <div className="flex items-center mb-4">
                <button
                  className={theme === "dark" ? "text-gray-400 mr-2" : "text-gray-600 mr-2"}
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  {chatOpen ? (
                    <ChevronLast className="h-6 w-6" />
                  ) : (
                    <ChevronFirst className="h-6 w-6" />
                  )}
                </button>
                <div
                  className={`flex h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full ${
                    chatOpen ? "space-x-1" : "space-x-20"
                  } ${theme === "dark" ? "bg-[#262626]" : "bg-gray-200"}`}
                >
                  {["Chat", "Summary", "Flashcards", "Quiz", "Chapters", "Transcripts", "Notes"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                        activeTab === tab ? (theme === "dark" ? "bg-[#121212]" : "bg-white") : ""
                      } ${tab === "Transcripts" ? "mr-1" : "ml-1"} ${theme === "dark" ? "text-white" : "text-black"}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
                {activeTab === "Chat" && <Chat sessionId={sessionId ?? undefined} />}
                {activeTab === "Summary" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Summary error={summaryError ?? ""} content={content ?? ""} loading={loadingSummary} refetch={refetchSummary} />
                  </div>
                )}
                {activeTab === "Flashcards" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Flashcards flashcards={flashcards} loading={loadingFlashcards} error={flashcardsError} refetch={refetchFlashcards} />
                  </div>
                )}
                {activeTab === "Quiz" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Quiz quizData={quizData} loading={loadingQuiz} error={quizError} refetch={refetchQuiz} />
                  </div>
                )}
                {activeTab === "Chapters" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Chapters chapters={chapters} loading={loadingChapters} error={chaptersError} refetch={refetchChapters} />
                  </div>
                )}
                {activeTab === "Transcripts" && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Transcripts transcripts={transcripts} loading={loadingTranscripts} error={transcriptsError} refetch={refetchTranscripts} />
                  </div>
                )}
                {activeTab === "Notes" && <Notes />}
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 flex flex-col md:hidden">
            <div
              className={`flex h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                chatOpen ? "space-x-1" : "space-x-4"
              } ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}
            >
              <button
                className={theme === "dark" ? "px-2 py-2 text-gray-400" : "px-2 py-2 text-gray-600"}
                onClick={() => setChatOpen(!chatOpen)}
              >
                {chatOpen ? (
                  <ChevronLast className="h-6 w-6" />
                ) : (
                  <ChevronFirst className="h-6 w-6" />
                )}
              </button>
              {["Chat", "Summary", "Flashcards", "Quiz", "Chapters", "Transcripts", "Notes"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 shrink-0 ${
                    activeTab === tab ? (theme === "dark" ? "bg-black" : "bg-gray-200") : (theme === "dark" ? "bg-[#121212]" : "bg-white")
                  } ${theme === "dark" ? "text-white" : "text-black"}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              {activeTab === "Chat" && (
                <div className={`flex-1 flex flex-col p-4 rounded-lg ${theme === "dark" ? "bg-[#121212]" : "bg-white"}`}>
                  <div
                    className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      maxHeight: "calc(100vh - 300px)",
                      display: "flex",
                      flexDirection: "column-reverse",
                    }}
                  >
                    <Chat sessionId={sessionId ?? undefined} />
                  </div>
                </div>
              )}
              {activeTab === "Summary" && <Summary error={summaryError ?? ""} content={content ?? ""} loading={loadingSummary} refetch={refetchSummary} />}
              {activeTab === "Flashcards" && <Flashcards flashcards={flashcards} loading={loadingFlashcards} error={flashcardsError} refetch={refetchFlashcards} />}
              {activeTab === "Quiz" && <Quiz quizData={quizData} loading={loadingQuiz} error={quizError} refetch={refetchQuiz} />}
              {activeTab === "Chapters" && <Chapters chapters={chapters} loading={loadingChapters} error={chaptersError} refetch={refetchChapters} />}
              {activeTab === "Transcripts" && <Transcripts transcripts={transcripts} loading={loadingTranscripts} error={transcriptsError} refetch={refetchTranscripts} />}
              {activeTab === "Notes" && <Notes />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}