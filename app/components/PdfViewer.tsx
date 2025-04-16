// "use client"

// import type React from "react"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw, Maximize, Minimize, List } from "lucide-react"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// interface PDFViewerProps {
//   url: string
//   filename?: string
// }

// export function PDFViewer({ url, filename = "document.pdf" }: PDFViewerProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [scale, setScale] = useState(1)
//   const [rotation, setRotation] = useState(0)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const containerRef = useRef<HTMLDivElement>(null)

//   // In a real implementation, we would use a PDF library like pdf.js
//   // This is a simplified mock version
//   useEffect(() => {
//     // Mock setting total pages
//     setTotalPages(10)
//   }, [url])

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1)
//     }
//   }

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1)
//     }
//   }

//   const zoomIn = () => {
//     setScale(Math.min(scale + 0.1, 2))
//   }

//   const zoomOut = () => {
//     setScale(Math.max(scale - 0.1, 0.5))
//   }

//   const rotate = () => {
//     setRotation((rotation + 90) % 360)
//   }

//   const toggleFullscreen = () => {
//     if (!isFullscreen) {
//       containerRef.current?.requestFullscreen().catch((err) => {
//         console.error(`Error attempting to enable fullscreen: ${err.message}`)
//       })
//     } else {
//       document.exitFullscreen().catch((err) => {
//         console.error(`Error attempting to exit fullscreen: ${err.message}`)
//       })
//     }
//     setIsFullscreen(!isFullscreen)
//   }

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(!!document.fullscreenElement)
//     }

//     document.addEventListener("fullscreenchange", handleFullscreenChange)
//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange)
//     }
//   }, [])

//   const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const page = Number.parseInt(e.target.value)
//     if (!isNaN(page) && page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   const renderThumbnails = () => {
//     return Array.from({ length: totalPages }, (_, i) => (
//       <div
//         key={i}
//         className={`p-2 cursor-pointer border rounded-md mb-2 ${currentPage === i + 1 ? "border-primary bg-primary/10" : "border-border"}`}
//         onClick={() => setCurrentPage(i + 1)}
//       >
//         <div className="aspect-[3/4] bg-muted flex items-center justify-center text-xs">Page {i + 1}</div>
//       </div>
//     ))
//   }

//   return (
//     <div ref={containerRef} className="flex flex-col">
//       {/* Toolbar */}
//       <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-muted rounded-t-lg mb-4">
//         <div className="flex items-center gap-1">
//           <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage <= 1}>
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <div className="flex items-center gap-1 mx-1">
//             <Input
//               type="number"
//               value={currentPage}
//               onChange={handlePageInput}
//               className="w-16 h-8"
//               min={1}
//               max={totalPages}
//             />
//             <span className="text-sm text-muted-foreground">/ {totalPages}</span>
//           </div>

//           <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage >= totalPages}>
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="flex items-center gap-1">
//           <Button variant="outline" size="icon" onClick={zoomOut}>
//             <ZoomOut className="h-4 w-4" />
//           </Button>

//           <span className="text-sm mx-1">{Math.round(scale * 100)}%</span>

//           <Button variant="outline" size="icon" onClick={zoomIn}>
//             <ZoomIn className="h-4 w-4" />
//           </Button>

//           <Button variant="outline" size="icon" onClick={rotate}>
//             <RotateCw className="h-4 w-4" />
//           </Button>

//           <Button variant="outline" size="icon" onClick={toggleFullscreen}>
//             {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
//           </Button>

//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <List className="h-4 w-4" />
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left">
//               <div className="py-4">
//                 <h3 className="text-lg font-medium mb-4">Pages</h3>
//                 <div className="grid grid-cols-2 gap-2">{renderThumbnails()}</div>
//               </div>
//             </SheetContent>
//           </Sheet>

//           <Button variant="outline" size="icon" asChild>
//             <a href={url} download={filename}>
//               <Download className="h-4 w-4" />
//             </a>
//           </Button>
//         </div>
//       </div>

//       {/* PDF Viewer */}
//       <div className="relative overflow-auto border rounded-lg bg-white flex items-center justify-center">
//         <div
//           style={{
//             transform: `scale(${scale}) rotate(${rotation}deg)`,
//             transformOrigin: "center",
//             transition: "transform 0.2s ease",
//           }}
//           className="min-h-[70vh] w-full"
//         >
//           {/* This would be replaced with actual PDF rendering */}
//           <div className="flex items-center justify-center h-full">
//             <div className="aspect-[3/4] w-full max-w-xl bg-white border shadow-sm p-8 flex flex-col">
//               <div className="text-center mb-8">
//                 <h3 className="text-xl font-bold">Sample PDF Document</h3>
//                 <p className="text-muted-foreground">
//                   Page {currentPage} of {totalPages}
//                 </p>
//               </div>

//               <div className="flex-1 flex flex-col gap-4">
//                 <div className="h-4 bg-muted rounded w-full"></div>
//                 <div className="h-4 bg-muted rounded w-3/4"></div>
//                 <div className="h-4 bg-muted rounded w-5/6"></div>
//                 <div className="h-4 bg-muted rounded w-2/3"></div>
//                 <div className="h-4 bg-muted rounded w-full"></div>
//                 <div className="h-4 bg-muted rounded w-4/5"></div>

//                 <div className="my-4"></div>

//                 <div className="h-4 bg-muted rounded w-full"></div>
//                 <div className="h-4 bg-muted rounded w-3/4"></div>
//                 <div className="h-4 bg-muted rounded w-5/6"></div>
//                 <div className="h-4 bg-muted rounded w-2/3"></div>
//                 <div className="h-4 bg-muted rounded w-full"></div>
//                 <div className="h-4 bg-muted rounded w-4/5"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


// 'use client';

// import { PdfViewerComponent } from '@syncfusion/ej2-react-pdfviewer';
// import '@syncfusion/ej2-react-pdfviewer/styles/material.css'; // optional styling

// export default function PDFViewerClient() {
//   return (
//     <PdfViewerComponent
//       id="pdfViewer"
//       documentPath="https://cloudnotte.fra1.digitaloceanspaces.com/uploads/56f8d49b-6f95-413b-8a31-038ce054b9d5.pdf"
//       style={{ height: '800px', width: '100%' }}
//       serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/pdfviewer"
//     />
//   );
// }
