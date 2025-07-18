"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";

// --- AppContext ---
type AppContextType = {
  sideBarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isAuthModalOpen: boolean;
  toggleAuthModal: () => void;
  handleAuthSuccess: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleAuthModal = () => {
    setIsAuthModalOpen((prev) => !prev);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false); // Close modal on successful authentication
  };

  return (
    <AppContext.Provider
      value={{
        sideBarOpen,
        setSideBarOpen,
        theme,
        setTheme,
        isAuthModalOpen,
        toggleAuthModal,
        handleAuthSuccess,
      }}
    >
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

export { AppContextProvider, useAppContext };