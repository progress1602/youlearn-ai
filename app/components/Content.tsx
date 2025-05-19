'use client';

import Head from 'next/head';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ChevronFirst, ChevronLast } from 'lucide-react';
import { Chat } from '../components/Features/Chat';
import Summary from '../components/Features/Summary';
import { Flashcards } from './Features/FlashCards';
import { Quiz } from '../components/Features/Quiz';
import { Chapters } from '../components/Features/Chapters';
import Transcripts from '../components/Features/Transcript';
import Notes from './Features/Notes';
import FileViewer from './file_viewer';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useRouter, useSearchParams } from 'next/navigation';

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

export default function Home() {
  const { sideBarOpen, setSideBarOpen, theme } = useAppContext();
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Chat');
  const [session, setSession] = useState<Session>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
   const hasFetched = useRef(false); // New ref to prevent double fetch
  

  // Use sessionStorage as fallback for query parameters
  const urlFromQuery = searchParams.get('url') || sessionStorage.getItem('topicUrl');
  const textFromQuery = searchParams.get('fileType') || sessionStorage.getItem('fileType');
  const sessionId = searchParams.get('id') || sessionStorage.getItem('topicId');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchSessions = async ({ id }: { id: string }) => {
    console.log('Fetching session with ID:', id);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error(result.errors[0]?.message || 'GraphQL error');
      }

      const fetchedSession = result.data?.getSession || {};
      setSession(fetchedSession);
    } catch (err: unknown) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     // Prevent fetching if already fetched
     if (hasFetched.current) return;
     hasFetched.current = true;

    console.log('Query params and session storage:', {
      urlFromQuery,
      textFromQuery,
      sessionId,
    });

    if (!urlFromQuery && textFromQuery !== 'text') {
      console.warn('Redirecting to /app: No url or valid fileType', { urlFromQuery, textFromQuery });
      router.push('/app');
      return;
    }
    if (textFromQuery === 'text' && sessionId) {
      fetchSessions({ id: sessionId });
    }

    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      setSideBarOpen(window.innerWidth >= 768);

      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile !== isMobile) {
          setSideBarOpen(!mobile);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, setSideBarOpen, searchParams, router, urlFromQuery, textFromQuery, sessionId]);

  // Memoize ContentViewer to prevent unnecessary re-renders
  const ContentViewer = useMemo(() => {
    if (textFromQuery === 'text') {
      return loading ? (
        <h1 className="mt-60">Loading..</h1>
      ) : (
        <div className={`p-4 rounded-lg flex-1 overflow-y-auto ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'}`}>
          <pre className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {session?.processedData?.extractedText ?? session?.title ?? ''}
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
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#171717] text-white' : 'bg-gray-100 text-black'}`}>
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
        className={`flex-1 ${
          sideBarOpen && !isMobile ? 'ml-64' : 'ml-0'
        } transition-all duration-300 flex flex-col`}
      >
        <header className={`w-full p-4 flex items-center justify-between sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#171717]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            {(!sideBarOpen || isMobile) && (
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
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col md:flex-row space-x-0 md:space-x-1">
          {/* Always render ContentViewer on desktop, conditionally on mobile */}
          {!isMobile && <div className="flex-1">{ContentViewer}</div>}
          {isMobile && chatOpen && <div className="flex-1">{ContentViewer}</div>}

          <div className={`hidden md:flex ${chatOpen ? 'w-[35rem]' : 'flex-1'}`}>
            <div className={`p-4 rounded-lg flex flex-col h-full transition-all duration-300 w-full ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <button
                  className={theme === 'dark' ? 'text-gray-400 mr-2' : 'text-gray-600 mr-2'}
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
                    chatOpen ? 'space-x-1' : 'space-x-20'
                  } ${theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-200'}`}
                >
                  {['Chat', 'Summary', 'Flashcards', 'Quiz', 'Chapters', 'Transcripts', 'Notes'].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                        activeTab === tab ? (theme === 'dark' ? 'bg-[#121212]' : 'bg-white') : ''
                      } ${tab === 'Transcripts' ? 'mr-1' : 'ml-1'} ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col">
                {activeTab === 'Chat' && <Chat sessionId={sessionId ?? undefined} />}
                {activeTab === 'Summary' && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Summary />
                  </div>
                )}
                {activeTab === 'Flashcards' && <Flashcards />}
                {activeTab === 'Quiz' && <Quiz />}
                {activeTab === 'Chapters' && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Chapters />
                  </div>
                )}
                {activeTab === 'Transcripts' && (
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Transcripts />
                  </div>
                )}
                {activeTab === 'Notes' && <Notes />}
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 flex flex-col md:hidden">
            <div
              className={`flex h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                chatOpen ? 'space-x-1' : 'space-x-4'
              } ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'}`}
            >
              <button
                className={theme === 'dark' ? 'px-2 py-2 text-gray-400' : 'px-2 py-2 text-gray-600'}
                onClick={() => setChatOpen(!chatOpen)}
              >
                {chatOpen ? (
                  <ChevronLast className="h-6 w-6" />
                ) : (
                  <ChevronFirst className="h-6 w-6" />
                )}
              </button>
              {['Chat', 'Summary', 'Flashcards', 'Quiz', 'Chapters', 'Transcripts', 'Notes'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 shrink-0 ${
                    activeTab === tab ? (theme === 'dark' ? 'bg-black' : 'bg-gray-200') : (theme === 'dark' ? 'bg-[#121212]' : 'bg-white')
                  } ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              {activeTab === 'Chat' && (
                <div className={`flex-1 flex flex-col p-4 rounded-lg ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white'}`}>
                  <div
                    className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      maxHeight: 'calc(100vh - 300px)',
                      display: 'flex',
                      flexDirection: 'column-reverse',
                    }}
                  >
                    <Chat sessionId={sessionId ?? undefined} />
                  </div>
                </div>
              )}
              {activeTab === 'Summary' && <Summary />}
              {activeTab === 'Flashcards' && <Flashcards />}
              {activeTab === 'Quiz' && <Quiz />}
              {activeTab === 'Chapters' && <Chapters />}
              {activeTab === 'Transcripts' && <Transcripts />}
              {activeTab === 'Notes' && <Notes />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}