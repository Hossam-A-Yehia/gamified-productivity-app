import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";
import { cookieManager, COOKIE_NAMES } from "../utils/cookies";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = cookieManager.get(COOKIE_NAMES.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = cookieManager.get(COOKIE_NAMES.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data.data.tokens;
              cookieManager.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
                expires: 1 / 96, // 15 minutes
                secure: true,
                sameSite: "lax",
              });

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              return this.api(originalRequest);
            }
          } catch (refreshError) {
            cookieManager.clearAuth();
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.get(url);
  }

  async post<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.post(url, data);
  }

  async put<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.put(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.delete(url);
  }

  async patch<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.api.patch(url, data);
  }

  private async refreshToken(refreshToken: string) {
    return this.api.post("/auth/refresh", { refreshToken });
  }

  async ping() {
    return this.get("/ping");
  }
}

export const apiService = new ApiService();
export default apiService;
