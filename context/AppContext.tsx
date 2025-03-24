"use client";

import { createContext, useState, useContext } from "react";

type AppContextType = {
  sideBarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    <AppContext.Provider value={{ sideBarOpen, setSideBarOpen }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};
