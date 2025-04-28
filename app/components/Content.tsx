'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
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

export default function Home() {
  const { sideBarOpen, setSideBarOpen } = useAppContext();
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Chat');
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFromQuery = searchParams.get('url');
  const textFromQuery = searchParams.get('text'); // Get text from URL query
  const sessionId = searchParams.get('id'); // Get sessionId from URL

  useEffect(() => {
    // Redirect if neither URL nor text is provided
    if (!urlFromQuery && !textFromQuery) {
      router.push('/');
      return;
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
  }, [isMobile, setSideBarOpen, searchParams, router, urlFromQuery, textFromQuery]);

  // Component to display text or file
  const ContentViewer = () => {
    if (textFromQuery) {
      return (
        <div className="p-4 bg-[#121212] rounded-lg flex-1 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-white">{textFromQuery}</pre>
        </div>
      );
    }
    if (urlFromQuery) {
      return <FileViewer url={urlFromQuery} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
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
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col md:flex-row space-x-0 md:space-x-1">
          {chatOpen && <ContentViewer />}

          <div className={`hidden md:flex ${chatOpen ? 'w-[35rem]' : 'flex-1'}`}>
            <div className="bg-[#121212] p-4 rounded-lg flex flex-col h-full transition-all duration-300 w-full">
              <div className="flex items-center mb-4">
                <button
                  className="text-gray-400 mr-2"
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  {chatOpen ? (
                    <ChevronLast className="h-6 w-6" />
                  ) : (
                    <ChevronFirst className="h-6 w-6" />
                  )}
                </button>
                <div
                  className={`flex bg-[#262626] h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full ${
                    chatOpen ? 'space-x-1' : 'space-x-20'
                  }`}
                >
                  {['Chat', 'Summary', 'Flashcards', 'Quiz', 'Chapters', 'Transcripts', 'Notes'].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg mt-1 mb-1 flex items-center space-x-2 shrink-0 ${
                        activeTab === tab ? 'bg-[#121212]' : ''
                      } ${tab === 'Transcripts' ? 'mr-1' : 'ml-1'}`}
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
              className={`flex bg-[#121212] h-12 rounded-xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                chatOpen ? 'space-x-1' : 'space-x-4'
              }`}
            >
              <button
                className="px-2 py-2 text-gray-400"
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
                    activeTab === tab ? 'bg-black' : 'bg-[#121212]'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex-1 overflow-hidden flex flex-col">
              {activeTab === 'Chat' && (
                <div className="flex-1 flex flex-col p-4 rounded-lg bg-[#121212]">
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