import { useState, useEffect, useMemo } from "react";
import { SearchService } from "../services/search.service";
import { useSearchStore } from "../store/search.store";
import { Smartphone } from "../types";
import { SearchResult } from "../utils/searchIndex";

export interface UseSmartphoneSearchProps {
  initialQuery?: string;
  debounceMs?: number;
  limit?: number;
}

export function useSmartphoneSearch({
  initialQuery = "",
  debounceMs = 250,
  limit = 8,
}: UseSmartphoneSearchProps = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const {
    recentSearches,
    addRecentSearch,
    addSelectedDevice,
    selectedDevices,
  } = useSearchStore();

  // 1. Debouncing mechanism for mobile optimizations and thin thread usage
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  // 2. Fetch suggestions from the indexed fuzzy search service
  const suggestions = useMemo<SearchResult[]>(() => {
    const trimmed = debouncedQuery.trim();
    return SearchService.searchPhones(trimmed, {
      limit,
      recentSearches,
    });
  }, [debouncedQuery, limit, recentSearches]);

  // Reset keyboard navigation cursor when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  // 3. Direct selection handler to register in Zustand and execute callbacks
  const selectSuggestion = (phone: Smartphone, onSelect?: (selectedPhone: Smartphone) => void) => {
    if (!phone) return;
    
    // Save keyword search to history
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    
    // Track selected device specification history
    addSelectedDevice(phone);

    // Call callback
    if (onSelect) {
      onSelect(phone);
    }

    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // 4. Keyboard Navigation Handler
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    onSelect?: (selectedPhone: Smartphone) => void
  ) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex].phone, onSelect);
        } else if (suggestions.length > 0) {
          // Select topmost result by default
          selectSuggestion(suggestions[0].phone, onSelect);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    recentSearches,
    selectedDevices,
    selectSuggestion,
    handleKeyDown,
  };
}
