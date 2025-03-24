import Head from "next/head";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>General Chemistry Explained in 19 Minutes</title>
      </Head>

      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">
          GENERAL CHEMISTRY explained in 19 Minutes
        </h1>
        <div className="flex space-x-2">
          <select className="bg-gray-800 text-white p-2 rounded">
            <option>US</option>
            <option>GB</option>
          </select>
          <button className="bg-white text-black px-4 py-2 rounded">
            Sign in
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex p-4 space-x-4">
        {/* Video Thumbnail Section */}
        <div className="flex-1 bg-gray-800 p-4 rounded-lg">
          <div className="relative">
            {/* Video Thumbnail */}
            <div className="bg-blue-900 h-80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white">
                  GENERAL CHEMISTRY
                </h2>
                <div className="mt-2">
                  <button className="bg-red-600 text-white p-2 rounded-full">
                    ▶
                  </button>
                </div>
              </div>
            </div>
            {/* Watch on YouTube Button */}
            <div className="mt-2">
              <button className="bg-gray-700 text-white px-4 py-2 rounded flex items-center space-x-2">
                <span>Watch on</span>
                <span className="text-red-600">YouTube</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-4">
            <button className="bg-gray-700 px-4 py-2 rounded">Chapters</button>
            <button className="bg-gray-700 px-4 py-2 rounded">
              Transcripts
            </button>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Structure of Atoms</h3>
            <p className="text-sm text-gray-400">
              Atoms are the building blocks of matter, consisting of a nucleus
              made of protons and neutrons, surrounded by electrons. The specific
              element is determined by the number of protons found in the nucleus.
              Although initial representations of atoms suggest a simple...
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="w-[500px] bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">K</h3>
            <div className="flex space-x-2">
              <button className="text-gray-400">Chat</button>
              <button className="text-gray-400">Flashcards</button>
              <button className="text-gray-400">Study Guide</button>
              <button className="text-gray-400">Summary</button>
              <button className="text-gray-400">Note</button>
            </div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg mb-4 text-center">
            <p className="text-sm">
              Welcome to the chat! Ask me anything. I may not always be right,
              but your feedback will help me improve!
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <button className="bg-gray-700 px-4 py-2 rounded text-left flex justify-between items-center">
              <span>What are the four main types of chemical...</span>
              <span className="text-gray-400">↳</span>
            </button>
            <button className="bg-gray-700 px-4 py-2 rounded text-left flex justify-between items-center">
              <span>How does the concept of Gibbs free energy relate...</span>
              <span className="text-gray-400">↳</span>
            </button>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Ask anything..."
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
            <div className="flex items-center mt-2">
              <label className="text-sm mr-2">Learn+</label>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}