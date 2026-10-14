import { create } from "zustand";
import { Smartphone } from "../types";
import { StorageManager } from "../utils/storage";

interface SearchState {
  searchQuery: string;
  discoveredPhones: Smartphone[] | null;
  searchHistory: string[]; // Conversational/AI queries
  recentSearches: string[]; // Local fuzzy-search keywords
  selectedDevices: Smartphone[]; // Historically selected devices for comparison

  setSearchQuery: (query: string) => void;
  setDiscoveredPhones: (phones: Smartphone[] | null) => void;
  addSearchHistory: (query: string) => void;
  clearHistory: () => void;

  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  addSelectedDevice: (phone: Smartphone) => void;
  clearSelectedDevices: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: "",
  discoveredPhones: null,
  searchHistory: StorageManager.getItem<string[]>("search-history", [
    "هاتف ذو كاميرا زوم قوية وسعر أقل من 800 دولار",
    "هاتف خفيف الوزن ببطارية تدوم ممتاز وبشحن سريع جداً",
    "أحدث الهواتف ذات معالجات 3 نانومتر وبقلم مدمج",
  ]),
  recentSearches: StorageManager.getItem<string[]>("recent-searches", [
    "iphone 16",
    "s24 ultra",
    "xiaomi 14",
  ]),
  selectedDevices: StorageManager.getItem<Smartphone[]>("selected-devices", []),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setDiscoveredPhones: (phones) => set({ discoveredPhones: phones }),

  addSearchHistory: (query) => {
    if (!query || query.trim() === "") return;
    const current = get().searchHistory;
    const filtered = current.filter((h) => h !== query);
    const updated = [query, ...filtered].slice(0, 10); // Keep max 10 entries

    set({ searchHistory: updated });
    StorageManager.setItem("search-history", updated);
  },

  clearHistory: () => {
    set({ searchHistory: [] });
    StorageManager.setItem("search-history", []);
  },

  addRecentSearch: (query) => {
    if (!query || query.trim() === "") return;
    const trimmed = query.trim().toLowerCase();
    const current = get().recentSearches;
    const filtered = current.filter((h) => h.toLowerCase() !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, 8); // Keep max 8

    set({ recentSearches: updated });
    StorageManager.setItem("recent-searches", updated);
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    StorageManager.setItem("recent-searches", []);
  },

  addSelectedDevice: (phone) => {
    if (!phone || !phone.name) return;
    const current = get().selectedDevices;
    // Prevent duplicate entries of the same device by name matching
    const filtered = current.filter((item) => item.name.toLowerCase() !== phone.name.toLowerCase());
    const updated = [phone, ...filtered].slice(0, 5); // Keep max 5 recently selected components

    set({ selectedDevices: updated });
    StorageManager.setItem("selected-devices", updated);
  },

  clearSelectedDevices: () => {
    set({ selectedDevices: [] });
    StorageManager.setItem("selected-devices", []);
  },
}));
