import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";

const API_BASE_URL = "https://backend-r0vc.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, clearAuth } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/admin/auth/refresh`,
            { refreshToken }
          );

          const { accessToken: newAccessToken } = response.data;
          useAuthStore.setState({ accessToken: newAccessToken });

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          clearAuth();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        clearAuth();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ========================= AUTH SERVICE =========================
export const authService = {
  login: (email: string, password: string) =>
    apiClient.post("/api/admin/auth/login", { email, password }),

  logout: () => apiClient.post("/api/admin/auth/logout"),

  refresh: (refreshToken: string) =>
    apiClient.post("/api/admin/auth/refresh", { refreshToken }),

  getProfile: () => apiClient.get("/api/admin/auth/me"),

  // Add this method for updating name, email, and password
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    apiClient.put("/api/admin/auth/update-profile", data),
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
