"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { submitURLMutation } from "@/app/api/graphql/querys/literals/url";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface UploadInputProps {
  setSubmittedContent: React.Dispatch<
    React.SetStateAction<{ type: string; value: string }[]>
  >;
}

interface UploadResponse {
  url: string;
  [key: string]: string | number | boolean | null | undefined;
}

export const UploadFile = async (formData: FormData): Promise<UploadResponse> => {
  try {
    const res = await axios({
      url: "https://api.cloudnotte.com/api/rest/upload/file",
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("UploadFile response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default function UploadInput({ setSubmittedContent }: UploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    console.log("Selected files:", Array.from(files).map((f) => f.name));
    setIsLoading(true);

    const fileArray = Array.from(files);
    let hasSuccess = false;

    for (const file of fileArray) {
      try {
        // Step 1: Upload file to Cloudnotte
        console.log(`Uploading file: ${file.name}`);
        const formData = new FormData();
        formData.append("file", file);
        const uploadResponse = await UploadFile(formData);

        const fileUrl = uploadResponse.url;
        console.log(`Uploaded URL for ${file.name}:`, fileUrl);

        if (!fileUrl) {
          throw new Error("No URL returned from upload");
        }

        // Step 2: Submit URL to GraphQL backend using fetch
        console.log(`Submitting URL to GraphQL: ${fileUrl}`);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: submitURLMutation(fileUrl),
          }),
        });

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
        }

        // Parse the response
        const graphqlResponse = await response.json();
        console.log("GraphQL response:", graphqlResponse);

        // Check for GraphQL errors
        if (graphqlResponse.errors) {
          throw new Error(
            `GraphQL errors: ${graphqlResponse.errors
              .map((e: { message: string }) => e.message)
              .join(", ")}`
          );
        }

        // Verify mutation data
        const mutationData = graphqlResponse.data?.submitURL;
        if (!mutationData) {
          throw new Error("GraphQL mutation returned no data");
        }

        // Update state with file name
        console.log(`Adding ${file.name} to state`);
        setSubmittedContent((prev) => [
          ...prev,
          { type: "File", value: file.name },
        ]);

        

        hasSuccess = true; // Mark file was successfully processed
      } catch (error: unknown) {
        console.error(`Error processing file ${file.name}:`, error);
        const errorMessage =
          error instanceof Error && error.message.includes("Failed to fetch")
            ? "Network error: Could not reach the GraphQL server"
            : error instanceof Error
            ? error.message
            : "Unknown error";
            return toast.error(errorMessage);
        setSubmittedContent((prev) => [
          ...prev,
          { type: "Error", value: `Failed to process ${file.name}: ${errorMessage}` },
        ]);
      }
    }

    // Refresh the browser if file was successfully processed
    if (hasSuccess) {
      window.location.reload();
    }

    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className={`border border-gray-700 rounded-xl p-4 flex flex-col items-start justify-start text-white hover:shadow-gray-500 w-full h-full transition duration-300 hover:scale-105 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Upload className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
        <span className="text-gray-100 text-sm sm:text-[16px]">
          {isLoading ? "Uploading..." : "Upload"}
        </span>
        <span className="text-xs sm:text-sm text-gray-300">
          PDF, PPT, DOC, PPTX
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.ppt,.pptx,.doc,.docx"
        multiple
        className="hidden"
      />
    </div>
  );
}