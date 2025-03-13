"use client";

import { createContext, useReducer, useContext, ReactNode } from "react";
import { reducer } from "@/app/reducer";
import { AppState, Action } from "./types";

const initialState: AppState = {
  user: {
    id: 0,
    clerkUserId: "",
    coins: 0,
    firstName: "",
    lastName: "",
    email: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  documents: [],
  isSidebar: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
