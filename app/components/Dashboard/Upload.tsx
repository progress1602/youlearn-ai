"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { submitURLMutation } from "@/app/api/graphql/querys/literals/url";
import { useAppContext } from "@/context/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface UploadInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string; name?: string }[]>
  >;
  setNewSession: ({session}:{session:Session} ) => void;
}

interface UploadResponse {
  url: string;
  [key: string]: string | number | boolean | null | undefined;
}

export const UploadFile = async (
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const res = await axios({
      url: "https://api.cloudnotte.com/api/rest/upload/file",
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          onProgress(percentCompleted);
        }
      },
    });
    console.log("UploadFile response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default function UploadInput({ setSubmittedContent, setNewSession}: UploadInputProps) {
  const { theme } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadClick = () => {
    console.log("Upload button clicked");
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    // Retrieve username from localStorage with fallback
    const username = localStorage.getItem("username") || "defaultUser";
    console.log("Username from localStorage:", username);

    console.log("Selected files:", Array.from(files).map((f) => f.name));
    setIsLoading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of Array.from(files)) {
      // Validate file type
      if (file.type !== "application/pdf") {
        console.log(`Invalid file type for ${file.name}: ${file.type}`);
        toast.error(`Only PDF files are allowed. ${file.name} is not a PDF.`);
        continue; // Skip non-PDF files
      }

      try {
        // Step 1: Upload file to Cloudnotte
        console.log(`Uploading file: ${file.name}`);
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await UploadFile(formData, (progress) => {
          // Calculate overall progress: average progress of current file plus completed files
          const overallProgress = Math.round(
            ((completedFiles * 100) + progress) / totalFiles
          );
          setUploadProgress(overallProgress);
        });

        const fileUrl = uploadResponse.url;
        console.log(`Uploaded URL for ${file.name}:`, fileUrl);

        if (!fileUrl) {
          throw new Error("No URL returned from upload");
        }

        // Step 2: Submit URL to GraphQL backend
        console.log(`Submitting URL to GraphQL: ${fileUrl} for user: ${username}`);
        console.log("Sending GraphQL request to:", API_URL);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submitURLMutation(fileUrl, username),
            variables: {
              url: fileUrl,
              username: username,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
        }

        const graphqlResponse = await response.json();
        console.log("Full GraphQL response:", JSON.stringify(graphqlResponse, null, 2));

        if (graphqlResponse.errors) {
          throw new Error(
            `GraphQL errors: ${graphqlResponse.errors
              .map((e: { message: string }) => e.message)
              .join(", ")}`
          );
        }

        const mutationData = graphqlResponse.data?.submitURL;
        if (!mutationData) {
          console.error("GraphQL response lacks submitURL:", graphqlResponse);
          throw new Error("GraphQL response does not contain submitURL data");
        }

        // Check for success or alternative indicators
        if (!mutationData.success && mutationData.success !== undefined) {
          console.error("Mutation failed with success: false", mutationData);
          throw new Error(
            `GraphQL mutation failed: ${mutationData.message || "No additional details"}`
          );
        }

        // Log mutation data for debugging
        console.log("Mutation data:", mutationData);

        // Update state with file URL and name
        console.log(`Adding ${file.name} to state with URL: ${fileUrl}`);
        // setSubmittedContent((prev) => [
        //   ...prev,
        //   { type: "File", value: fileUrl, name: file.name },
        // ]);
        setNewSession({
          session:{
            id: mutationData.id,
            url: mutationData.url,
            username: username,
            title: file.name || "",
            createdAt: new Date().toISOString(),
            fileType: "pdf",
            isPending: false,
          },
        });
        toast.success(`Successfully uploaded ${file.name}`);
        completedFiles++;
        setUploadProgress(Math.round((completedFiles * 100) / totalFiles));
      } catch (error: unknown) {
        console.error(`Error processing file ${file.name}:`, error);
        const errorMessage =
          error instanceof Error && error.message.includes("Failed to fetch")
            ? "Network error: Could not reach the GraphQL server"
            : error instanceof Error
              ? error.message
              : "Unknown error";
        console.log(`Error message: ${errorMessage}`);
        toast.error(errorMessage);
        setSubmittedContent((prev) => [
          ...prev,
          { type: "Error", value: `Failed to process ${file.name}: ${errorMessage}` },
        ]);
      }
    }

    setIsLoading(false);
    setUploadProgress(0);
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className={`border rounded-xl p-4 flex flex-col items-start justify-start transition duration-300 hover:scale-105 w-full h-full ${
          theme === 'dark'
            ? `border-gray-700 text-white hover:shadow-gray-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`
            : `border-gray-300 text-black hover:shadow-gray-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`
        }`}
      >
        <Upload
          className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        />
        <span
          className={`text-sm sm:text-[16px] ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </span>
        <span
          className={`text-xs sm:text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          PDF Files Only
        </span>
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        multiple
        className="hidden"
      />
    </div>
  );
}