"use client";

import { useState, useRef } from "react";
import { Mic, X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RecordInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string }[]>
  >;
}

export default function RecordInput({ setSubmittedContent }: RecordInputProps) {
  const { theme } = useAppContext();
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioURL("");
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const saveRecording = async () => {
    if (!audioBlob || isSaving) return;

    setIsSaving(true);
    const audioFileName = `recording_${new Date().toISOString()}.wav`;

    try {
      // Step 1: Upload audio to external API
      console.log("Uploading audio blob:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      const formData = new FormData();
      formData.append("file", audioBlob, audioFileName);

      const uploadResponse = await fetch("https://cloudnotte.ifeanyi.dev/api/chat/file", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log("External API response:", uploadResult);

      // Extract URL from nested data.url
      const audioUrl = uploadResult.data?.url;
      if (!audioUrl || typeof audioUrl !== "string") {
        throw new Error("No valid URL returned from external API");
      }

      console.log(`Submitting URL to GraphQL: ${audioUrl}`);

      // Step 2: Submit URL to GraphQL backend
      const mutation = (inputValue: string, username: string) => `
        mutation submitAudioURL {
          submitURL(input: { url: "${inputValue.trim()}", username: "${username}" }) {
            id
            fileType
            createdAt
            url
            username
          }
        }
      `;

      // Retrieve username from localStorage, fallback to "default_user" if not found
      const username = localStorage.getItem("username") || "default_user";

      // Call the mutation function with audioUrl and username
      const query = mutation(audioUrl, username);

      const graphqlResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!graphqlResponse.ok) {
        const errorText = await graphqlResponse.text();
        throw new Error(`GraphQL request failed: ${graphqlResponse.status} - ${errorText}`);
      }

      const graphqlResult = await graphqlResponse.json();
      console.log("GraphQL response:", graphqlResult);

      if (graphqlResult.errors) {
        throw new Error(
          `GraphQL errors: ${graphqlResult.errors
            .map((e: { message: string }) => e.message)
            .join(", ")}`
        );
      }

      const mutationData = graphqlResult.data?.submitURL;
      if (!mutationData) {
        throw new Error("GraphQL mutation returned no data");
      }

      // Step 3: Update state
      console.log(`Adding ${audioFileName} to state`);
      setSubmittedContent((prev) => [
        ...prev,
        { type: "Audio", value: audioFileName },
      ]);

      console.log("Recording saved successfully");

      // Step 4: Reset state and close modal
      setIsRecordingModalOpen(false);
      setAudioBlob(null);
      setAudioURL("");
    } catch (error: unknown) {
      console.error(`Error processing audio ${audioFileName}:`, error);
      const errorMessage =
        error instanceof Error && error.message.includes("Failed to fetch")
          ? "Network error: Could not reach the server"
          : error instanceof Error
          ? error.message
          : "Unknown error";
      toast.error(errorMessage);
      setSubmittedContent((prev) => [
        ...prev,
        { type: "Error", value: `Failed to process ${audioFileName}: ${errorMessage}` },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsRecordingModalOpen(true)}
        className={`border rounded-xl p-4 flex flex-col items-start justify-start transition-transform duration-300 hover:scale-105 w-full h-full relative overflow-hidden group ${
          theme === 'dark'
            ? 'border-gray-700 text-white hover:shadow-gray-500'
            : 'border-gray-300 text-black hover:shadow-gray-300'
        }`}
      >
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
          }`}
        />
        <Mic
          className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 relative z-10 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        />
        <span
          className={`text-sm sm:text-[16px] relative z-10 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Record
        </span>
        <span
          className={`text-xs sm:text-sm relative z-10 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Record Your Lecture
        </span>
      </button>

      {isRecordingModalOpen && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 animate-fadeIn ${
            theme === 'dark' ? 'bg-black/50 backdrop-blur-sm' : 'bg-gray-500/30 backdrop-blur-sm'
          }`}
        >
          <div
            className={`rounded-2xl p-6 w-full max-w-lg border shadow-xl relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border-gray-800/50 text-white'
                : 'bg-gradient-to-br from-white to-gray-100 border-gray-300 text-black'
            }`}
          >
            <div
              className={`absolute inset-0 opacity-20 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
              }`}
            >
              {isRecording && (
                <div className="wave-container">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex gap-2 text-lg font-serif">
                <Mic
                  className={`h-5 w-5 mt-1 ${
                    theme === 'dark' ? 'text-[#99002b]' : 'text-[#99002b]'
                  }`}
                />
                <span
                  className={`bg-[#99002b] bg-clip-text text-transparent`}
                >
                  Record Audio
                </span>
              </div>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                className={`hover:text-gray-300 transition ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 font-serif relative z-10">
              <div className="text-center">
                <p
                  className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {isRecording
                    ? "Recording in progress..."
                    : audioURL
                    ? "Recording complete!"
                    : "Start your recording"}
                </p>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`rounded-full p-5 ${
                    isRecording
                      ? 'bg-[#99002b] animate-pulse'
                      : theme === 'dark'
                      ? 'bg-[#99002b]'
                      : 'bg-[#99002b]'
                  } hover:opacity-90 transition`}
                >
                  <Mic
                    className={`h-8 w-8 ${
                      theme === 'dark' ? 'text-white' : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {audioURL && (
                <div className="flex gap-4">
                  <button
                    onClick={playRecording}
                    className={`px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white'
                        : 'bg-gradient-to-r from-gray-300 to-gray-200 hover:from-gray-200 hover:to-gray-100 text-black'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Play
                  </button>
                  <button
                    onClick={deleteRecording}
                    className={`px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={saveRecording}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 ${
                      isSaving
                        ? theme === 'dark'
                          ? 'bg-gray-600 cursor-not-allowed text-white'
                          : 'bg-gray-400 cursor-not-allowed text-black'
                        : theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white'
                        : 'bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7 9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                      <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                    </svg>
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}