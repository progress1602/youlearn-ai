"use client";

import { createContext, useState, useContext, ReactNode } from "react";

// --- AppContext ---
type AppContextType = {
  sideBarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    <AppContext.Provider value={{ sideBarOpen, setSideBarOpen }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

// --- UrlContext ---
type UrlContextType = {
  url?: string;
  sessionID?: string;
  setUrl?: (url: string) => void;
  setSessonId?: (url: string) => void;
};

const UrlContext = createContext<UrlContextType | undefined>(undefined);

const UrlProvider = ({ children }: { children: ReactNode }) => {
  const [url, setUrl] = useState('');
  const [sessionID, setSessonId] = useState('');

  return (
    <UrlContext.Provider value={{ url, setUrl, sessionID, setSessonId }}>
      {children}
    </UrlContext.Provider>
  );
};

const useUrl = () => {
  const context = useContext(UrlContext);
  if (!context) {
    throw new Error("useUrl must be used within a UrlProvider");
  }
  return context;
};

// --- Exports ---
export {
  AppContextProvider,
  useAppContext,
  UrlProvider,
  useUrl,
};
