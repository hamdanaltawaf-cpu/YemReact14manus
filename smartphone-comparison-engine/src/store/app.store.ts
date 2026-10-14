import { create } from "zustand";
import { StorageManager } from "../utils/storage";

interface AppState {
  isDarkMode: boolean;
  appError: string | null;
  toggleTheme: () => void;
  setAppError: (error: string | null) => void;
  initTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDarkMode: (() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  })(),
  appError: null,
  
  toggleTheme: () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
    
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      const body = window.document.body;
      if (nextMode) {
        root.classList.add("dark");
        body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  },
  
  setAppError: (error) => set({ appError: error }),
  
  initTheme: () => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      const body = window.document.body;
      if (get().isDarkMode) {
        root.classList.add("dark");
        body.classList.add("dark");
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
      }
    }
  },
}));
