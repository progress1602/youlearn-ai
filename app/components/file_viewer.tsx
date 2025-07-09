import React from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useAppContext } from "@/context/AppContext";

type Props = {
  url: string;
};

export default function FileViewer({ url }: Props) {
  const { theme } = useAppContext();
  const fileExtension = url.split(".").pop()?.toLowerCase() || "";
  const isYouTube = /(?:youtu\.be|youtube\.com)/.test(url);
  const isTikTok = /tiktok\.com/.test(url);
  const isFacebook = /facebook\.com/.test(url);
  const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(fileExtension);
  const isVideoFile = ["mp4", "webm", "ogg", "mkv", "mov", "avi"].includes(fileExtension);
  const isPDF = fileExtension === "pdf";
  const isDoc = ["doc", "docx"].includes(fileExtension);
  const isPpt = ["ppt", "pptx"].includes(fileExtension);
  const isTxt = fileExtension === "txt";

  // 🔊 Audio files
  if (isAudio) {
    return (
      <div
        className={`flex items-center justify-center w-full rounded-[10px] ${
          theme === "dark" ? "bg-black" : "bg-gray-200"
        }`}
      >
        <audio controls src={url} />
      </div>
    );
  }

  // 🎥 Raw video files (local/network)
  if (isVideoFile) {
    return (
      <video
        controls
        className={`w-full max-h-[80vh] rounded-md ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <source src={url} type={`video/${fileExtension}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // 📄 PDF files (via iframe)
  if (isPDF) {
    return (
      <iframe
        src={url}
        className="w-full z-0 h-[90vh] rounded-md"
        style={{ border: "none" }}
        title="PDF Viewer"
      ></iframe>
    );
  }

  // 📝 DOC/DOCX files (via Google Docs Viewer)
  if (isDoc) {
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full z-0 h-[90vh] rounded-md"
        style={{ border: "none" }}
        title="Document Viewer"
      ></iframe>
    );
  }

  // 📊 PPT/PPTX files (via Google Docs Viewer)
  if (isPpt) {
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full z-0 h-[90vh] rounded-md"
        style={{ border: "none" }}
        title="Presentation Viewer"
      ></iframe>
    );
  }

  // 📜 TXT files
  if (isTxt) {
    return (
      <div
        className={`w-full h-[90vh] overflow-auto p-4 rounded-md border ${
          theme === "dark"
            ? "bg-[#121212] border-gray-800 text-white"
            : "bg-white border-gray-200 text-black"
        }`}
      >
        <pre
          className={`text-sm whitespace-pre-wrap ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          <object data={url} type="text/plain" className="w-full h-full">
            Unable to load text file.
          </object>
        </pre>
      </div>
    );
  }

  // ▶️ YouTube
  if (isYouTube) {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full z-0 aspect-video rounded-md"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="YouTube Video"
        ></iframe>
      );
    }
  }

  // 📱 TikTok
  if (isTikTok) {
    return (
      <>
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={getTikTokVideoId(url)}
          style={{ maxWidth: 605, minWidth: 325 }}
        >
          <section />
        </blockquote>
        <script async src="https://www.tiktok.com/embed.js"></script>
      </>
    );
  }

  // 👥 Facebook
  if (isFacebook) {
    return (
      <iframe
        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`}
        className="w-full z-0 max-h-[80vh] rounded-md"
        style={{ border: "none" }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Facebook Video"
      ></iframe>
    );
  }

  // 🤷‍♂️ Unknown type
  return (
    <div
      className={`text-center p-4 ${
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      }`}
    >
      <p>This file cannot be displayed.</p>
    </div>
  );
}

// 🔧 Helper: YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

// 🔧 Helper: TikTok video ID
function getTikTokVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}