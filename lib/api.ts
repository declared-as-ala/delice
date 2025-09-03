import axios, { AxiosError, AxiosResponse } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";

// Types for better type safety
interface ApiError {
  message: string;
  error?: string;
  code?: string;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    createdAt: string;
  };
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-r0vc.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // Handle network errors
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 errors (token expiry) - but NOT for login endpoint
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login")
    ) {
      originalRequest._retry = true;

      const { refreshToken, clearAuth, setTokens } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post<RefreshResponse>(
            `${API_BASE_URL}/api/admin/auth/refresh`,
            { refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 5000,
            }
          );

          const { accessToken: newAccessToken } = response.data;

          // Update store with new token
          setTokens(newAccessToken, refreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          clearAuth();

          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      } else {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Handle other HTTP errors with user-friendly messages
    const errorMessage = data?.message || getErrorMessage(status);

    // Don't show toast for login errors (401) or certain other errors that are handled by components
    if (
      status !== 404 &&
      status !== 422 &&
      !(status === 401 && originalRequest.url?.includes("/login"))
    ) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Helper function to get user-friendly error messages
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication required. Please login.";
    case 403:
      return "Access denied. You don't have permission.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict. Resource already exists.";
    case 422:
      return "Validation failed. Please check your input.";
    case 500:
      return "Server error. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
};

export default apiClient;

// ========================= AUTH SERVICE =========================
export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/admin/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<LogoutResponse> => {
    try {
      const { refreshToken } = useAuthStore.getState();

      // Always try to logout even without refresh token
      const response = await apiClient.post<LogoutResponse>(
        "/api/admin/auth/logout",
        refreshToken ? { refreshToken } : {}
      );

      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local auth
      console.warn("Logout request failed, clearing local auth:", error);
      throw error;
    }
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    try {
      const response = await apiClient.post<RefreshResponse>(
        "/api/admin/auth/refresh",
        {
          refreshToken,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get("/api/admin/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => {
    try {
      // Clean the data before sending
      const cleanData: any = {};

      if (data.name?.trim()) {
        cleanData.name = data.name.trim();
      }

      if (data.email?.trim()) {
        cleanData.email = data.email.trim().toLowerCase();
      }

      if (data.password?.trim()) {
        cleanData.password = data.password.trim();
      }

      const response = await apiClient.put(
        "/api/admin/auth/update-profile",
        cleanData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
// ========================= CUSTOMER SERVICE =========================
export const customerService = {
  getAll: (page = 1, limit = 10, search = "") =>
    apiClient.get(
      `/api/admin/customers?page=${page}&limit=${limit}&search=${search}`
    ),
  getById: (id: string) => apiClient.get(`/api/admin/customers/${id}`),
  update: (id: string, data: any) =>
    apiClient.put(`/api/admin/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/admin/customers/${id}`),
};

// ========================= ORDER SERVICE =========================
export const orderService = {
  getAll: (
    page = 1,
    limit = 10,
    status = "",
    paymentMethod = "",
    search = ""
  ) =>
    apiClient.get(
      `/api/admin/orders?page=${page}&limit=${limit}&status=${status}&paymentMethod=${paymentMethod}&search=${search}`
    ),

  getById: (id: string) => apiClient.get(`/api/admin/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.put(`/api/admin/orders/${id}/status`, { status }),

  toggleDelivery: (id: string) =>
    apiClient.put(`/api/admin/orders/${id}/delivery`),

  delete: (id: string) => apiClient.delete(`/api/admin/orders/${id}`),
};

// ========================= PRODUCT SERVICE =========================
export const productService = {
  // ----- Products -----
  getAll: (page = 1, limit = 10, search = "", category = "") =>
    apiClient.get(
      `/api/products?page=${page}&limit=${limit}&search=${search}&category=${category}`
    ),
  getById: (id: string) => apiClient.get(`/api/admin/products/${id}`),
  create: (data: any) => apiClient.post("/api/admin/products", data),
  update: (id: string, data: any) =>
    apiClient.put(`/api/admin/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/admin/products/${id}`),

  // ----- Variants -----
  addVariant: (productId: string, data: any) =>
    apiClient.post(`/api/admin/products/${productId}/variants`, data),
  updateVariant: (productId: string, variantId: string, data: any) =>
    apiClient.put(
      `/api/admin/products/${productId}/variants/${variantId}`,
      data
    ),
  updateVariantStock: (productId: string, variantId: string, stock: number) =>
    apiClient.put(
      `/api/admin/products/${productId}/variants/${variantId}/stock`,
      { stock }
    ),
  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete(`/api/admin/products/${productId}/variants/${variantId}`),
};
// ========================= STATS SERVICE =========================
export const statsService = {
  // Dashboard
  getDashboard: () => apiClient.get("/api/admin/dashboard/stats"),

  // Orders
  getRecentOrders: () => apiClient.get("/api/admin/dashboard/recent-orders"),
  getOrdersByHour: () => apiClient.get("/api/admin/dashboard/orders-by-hour"),

  // Sales & Revenue
  getSalesByPaymentMethod: () =>
    apiClient.get("/api/admin/dashboard/sales-by-payment-method"),
  getMonthlyRevenue: () =>
    apiClient.get("/api/admin/dashboard/monthly-revenue"),

  // Products
  getTopCategories: () => apiClient.get("/api/admin/dashboard/top-categories"),
  getLowStockProducts: () => apiClient.get("/api/admin/dashboard/low-stock"),

  // Customers
  getCustomerGrowth: () =>
    apiClient.get("/api/admin/dashboard/customer-growth"),
  getCustomerActivity: () =>
    apiClient.get("/api/admin/dashboard/customer-activity"),
};
// ========================= DISCOUNT SERVICE =========================
export const discountService = {
  getAll: (page = 1, limit = 10, search = "") =>
    apiClient.get(
      `/api/admin/discounts?page=${page}&limit=${limit}&search=${search}`
    ),

  getById: (id: string) => apiClient.get(`/api/admin/discounts/${id}`),

  create: (data: any) => apiClient.post("/api/admin/discounts", data),

  update: (id: string, data: any) =>
    apiClient.put(`/api/admin/discounts/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/admin/discounts/${id}`),
};
