"use client";

import { useState, useRef } from "react";
import { Mic, X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface RecordInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string }[]>
  >;
}

export default function RecordInput({ setSubmittedContent }: RecordInputProps) {
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
    // let hasSuccess = false;

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
      const mutation = `
        mutation submitURL {
          submitURL(input: {
            url: "${audioUrl}"
          }) {
            id
            fileType
            createdAt
            url
          }
        }
      `;

      const graphqlResponse = await fetch("http://164.90.157.191:4884/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: mutation }),
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

    //   hasSuccess = true;
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

    // Step 5: Refresh browser on success
    // if (hasSuccess) {
    //   window.location.reload();
    // }
  };

  return (
    <>
      <button
        onClick={() => setIsRecordingModalOpen(true)}
        className="border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:shadow-gray-500 transition-transform duration-300 hover:scale-105 w-full h-full relative overflow-hidden group"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Mic className="h-5 w-5 sm:h-6 sm:w-6 mb-2 relative z-10" />
        <span className="text-gray-100 text-sm sm:text-[16px] relative z-10">
          Record
        </span>
        <span className="text-xs sm:text-sm text-gray-300 relative z-10">
          Record Your Lecture
        </span>
      </button>

      {isRecordingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl p-6 w-full max-w-lg text-white border border-gray-800/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {isRecording && (
                <div className="wave-container">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex gap-2 text-[#ECEDEE] text-lg font-serif">
                <Mic className="h-5 w-5 mt-1 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Record Audio
                </span>
              </div>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                className="hover:text-gray-300 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 font-serif relative z-10">
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-4">
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
                      ? "bg-purple-400 animate-pulse"
                      : "bg-gradient-to-r from-purple-400 to-blue-400"
                  } hover:opacity-90 transition`}
                >
                  <Mic className="h-8 w-8" />
                </button>
              </div>

              {audioURL && (
                <div className="flex gap-4">
                  <button
                    onClick={playRecording}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-500 transition text-sm flex items-center gap-2"
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
                    className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 rounded-xl hover:from-red-800 hover:to-red-700 transition text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={saveRecording}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl transition text-sm flex items-center gap-2 ${
                      isSaving
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500"
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