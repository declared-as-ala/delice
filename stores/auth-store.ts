import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Additional states for better UX
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRefreshing: boolean;
  lastActivity: number;
}

interface AuthActions {
  // Core auth methods
  initializeAuth: () => Promise<void>;
  setAuth: (data: {
    admin: Admin;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearAuth: () => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setLoggingIn: (loading: boolean) => void;
  setLoggingOut: (loading: boolean) => void;
  setRefreshing: (loading: boolean) => void;

  // Token management
  setTokens: (accessToken: string, refreshToken: string) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Activity tracking
  updateLastActivity: () => void;

  // Profile updates
  updateAdmin: (admin: Admin) => void;

  // Logout functionality
  logout: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// Constants
const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const initialState: AuthState = {
  admin: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isLoggingIn: false,
  isLoggingOut: false,
  isRefreshing: false,
  lastActivity: Date.now(),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ==================== CORE AUTH METHODS ====================

      initializeAuth: async () => {
        const state = get();

        // Check for activity timeout
        const timeSinceLastActivity = Date.now() - (state.lastActivity || 0);
        if (timeSinceLastActivity > ACTIVITY_TIMEOUT) {
          set((draft) => {
            Object.assign(draft, initialState);
            draft.isLoading = false;
          });
          return;
        }

        if (state.accessToken && !state.isAuthenticated) {
          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            // Import authService dynamically to avoid circular dependency
            const { authService } = await import("@/lib/api");
            const response = await authService.getProfile();

            set((draft) => {
              draft.admin = response.data;
              draft.isAuthenticated = true;
              draft.isLoading = false;
              draft.lastActivity = Date.now();
            });
          } catch (error: any) {
            console.warn("Auth initialization failed:", error);
            set((draft) => {
              Object.assign(draft, initialState);
              draft.isLoading = false;
            });
          }
        } else if (state.accessToken && state.admin) {
          set((draft) => {
            draft.isAuthenticated = true;
            draft.isLoading = false;
            draft.lastActivity = Date.now();
          });
        } else {
          set((draft) => {
            draft.isLoading = false;
          });
        }
      },

      setAuth: (data) => {
        set((draft) => {
          draft.admin = data.admin;
          draft.accessToken = data.accessToken;
          draft.refreshToken = data.refreshToken;
          draft.isAuthenticated = true;
          draft.isLoading = false;
          draft.isLoggingIn = false;
          draft.error = null;
          draft.lastActivity = Date.now();
        });

        // Store login timestamp
        localStorage.setItem("lastLoginTime", Date.now().toString());
      },

      clearAuth: () => {
        set((draft) => {
          Object.assign(draft, initialState);
          draft.isLoading = false;
        });

        // Clear cached data
        localStorage.removeItem("lastLoginTime");
        sessionStorage.clear();
      },

      logout: async () => {
        set((draft) => {
          draft.isLoggingOut = true;
          draft.error = null;
        });

        try {
          // Import authService dynamically
          const { authService } = await import("@/lib/api");

          // Attempt server logout
          try {
            await authService.logout();
          } catch (logoutError) {
            console.warn(
              "Server logout failed, clearing local auth:",
              logoutError
            );
          }
        } finally {
          // Always clear local state
          set((draft) => {
            Object.assign(draft, initialState);
            draft.isLoading = false;
          });

          // Clear cached data
          localStorage.removeItem("lastLoginTime");
          sessionStorage.clear();
        }
      },

      // ==================== LOADING STATES ====================

      setLoading: (loading) => {
        set((draft) => {
          draft.isLoading = loading;
        });
      },

      setLoggingIn: (loading) => {
        set((draft) => {
          draft.isLoggingIn = loading;
        });
      },

      setLoggingOut: (loading) => {
        set((draft) => {
          draft.isLoggingOut = loading;
        });
      },

      setRefreshing: (loading) => {
        set((draft) => {
          draft.isRefreshing = loading;
        });
      },

      // ==================== TOKEN MANAGEMENT ====================

      setTokens: (accessToken, refreshToken) => {
        set((draft) => {
          draft.accessToken = accessToken;
          draft.refreshToken = refreshToken;
          draft.isAuthenticated = true;
          draft.lastActivity = Date.now();
        });
      },

      // ==================== ERROR HANDLING ====================

      setError: (error) => {
        set((draft) => {
          draft.error = error;
        });
      },

      clearError: () => {
        set((draft) => {
          draft.error = null;
        });
      },

      // ==================== ACTIVITY TRACKING ====================

      updateLastActivity: () => {
        set((draft) => {
          draft.lastActivity = Date.now();
        });
      },

      // ==================== PROFILE UPDATES ====================

      updateAdmin: (admin) => {
        set((draft) => {
          draft.admin = admin;
        });
      },
    })),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential data
        admin: state.admin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration if storage schema changes
        if (version === 0) {
          return {
            ...initialState,
            ...persistedState,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize auth after rehydration
          setTimeout(() => {
            state.initializeAuth();
          }, 0);
        }
      },
    }
  )
);

// ==================== SELECTORS ====================

// Basic auth info
export const useAuth = () =>
  useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
    isLoading: state.isLoading,
    error: state.error,
  }));

// Loading states
export const useAuthLoading = () =>
  useAuthStore((state) => ({
    isLoading: state.isLoading,
    isLoggingIn: state.isLoggingIn,
    isLoggingOut: state.isLoggingOut,
    isRefreshing: state.isRefreshing,
  }));

// Actions
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setAuth: state.setAuth,
    clearAuth: state.clearAuth,
    logout: state.logout,
    setError: state.setError,
    clearError: state.clearError,
    updateLastActivity: state.updateLastActivity,
    updateAdmin: state.updateAdmin,
  }));

// ==================== HOOKS ====================

// Activity tracker hook for components that need to track user activity
export const useActivityTracker = () => {
  const updateLastActivity = useAuthStore((state) => state.updateLastActivity);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      updateLastActivity();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateLastActivity]);
};
