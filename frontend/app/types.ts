import { JSX } from "react";
import {
  SET_USER,
  SET_DOCUMENT,
  CLOSE_SIDEBAR,
  TOGGLE_SIDEBAR,
} from "./actions";

export interface User {
  id: number;
  clerkUserId: string;
  coins: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: number;
  filename: string;
  fileUrl: string;
  userId: number;
  isPrinted: boolean;
  pageCount: number;
  status?: string;
}

export interface AppState {
  user: User;
  documents: Document[];
  isSidebar: boolean;
}

export interface MenuItems {
  name: string;
  icon: JSX.Element;
  url: string;
}

export type Action =
  | { type: typeof SET_USER; payload: User }
  | { type: typeof SET_DOCUMENT; payload: Document[] }
  | { type: typeof CLOSE_SIDEBAR }
  | { type: typeof TOGGLE_SIDEBAR };

export interface AddCoinsFormProps {
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}
