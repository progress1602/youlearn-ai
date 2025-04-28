"use client";

import { createContext, useState, useContext, ReactNode, } from "react";


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
// GraphQL endpoint
// const GRAPHQL_URL = "http://164.90.157.191:4884/graphql";

// // GraphQL query
// const       GET_SESSION_QUERY = `
//   query getSession {
//     getSession(id: "67ff7ca6fd4f3e167ba69335") {
//       id
//       createdAt
//       url
//       status
//       chats {
//         id
//         question
//         content
//         createdAt
//       }
//     }
//   }
// `;

// --- Exports ---
export { AppContextProvider, useAppContext, };