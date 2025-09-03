import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/lib/api";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  setAuth: (data: {
    admin: Admin;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

const get = () => useAuthStore.getState();
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // notice we can use get from Zustand here
      admin: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      initializeAuth: async () => {
        const state = get(); // use Zustand's get instead of useAuthStore.getState()
        if (state.accessToken && !state.isAuthenticated) {
          set({ isLoading: true });
          try {
            const response = await authService.getProfile();
            set({
              admin: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({
              admin: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else if (state.accessToken && state.admin) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
      setAuth: (data) =>
        set({
          admin: data.admin,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),
      clearAuth: () =>
        set({
          admin: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeAuth();
        }
      },
    }
  )
);
