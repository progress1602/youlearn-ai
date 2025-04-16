import React from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

type Props = {
  url: string;
};

export default function FileViewer({ url }: Props) {
  const fileExtension = url.split(".").pop()?.toLowerCase() || "";
  const isYouTube = /(?:youtu\.be|youtube\.com)/.test(url);
  const isTikTok = /tiktok\.com/.test(url);
  const isFacebook = /facebook\.com/.test(url);
  const isAudio = ["mp3", "wav", "ogg", "m4a"].includes(fileExtension);
  const isVideoFile = ["mp4", "webm", "ogg", "mkv", "mov", "avi"].includes(fileExtension);
  const isPDF = fileExtension === "pdf";

  // 🔊 Audio files
  if (isAudio) {
    return <audio controls src={url} className="w-full" />;
  }

  // 🎥 Raw video files (local/network)
  if (isVideoFile) {
    return (
      <video controls className="w-full max-h-[80vh] rounded-md">
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
        className="w-full h-[80vh] rounded-md"
        style={{ border: "none" }}
        title="PDF Viewer"
      ></iframe>
    );
  }

  // ▶️ YouTube
  if (isYouTube) {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full aspect-video rounded-md"
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
        className="w-full max-h-[80vh] rounded-md"
        style={{ border: "none" }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Facebook Video"
      ></iframe>
    );
  }

  // 🤷‍♂️ Unknown type
  return (
    <div className="text-center p-4 text-gray-500">
      <p>Unsupported file type or platform.</p>
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

