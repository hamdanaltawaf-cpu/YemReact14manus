import { useAppStore } from "../store/app.store";

export function useTheme() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return { isDarkMode, toggleTheme };
}
