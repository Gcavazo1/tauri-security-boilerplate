import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the app state interface
export interface AppState {
  darkMode: boolean;
  greeting: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
  setGreeting: (greeting: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create the store with persistence for theme preference
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // State
      darkMode: false,
      greeting: null,
      isLoading: false,
      error: null,
      
      // Actions
      setDarkMode: (darkMode) => set({ darkMode }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setGreeting: (greeting) => set({ greeting }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-storage', // Storage key
      partialize: (state) => ({ darkMode: state.darkMode }), // Only persist darkMode
    }
  )
); 