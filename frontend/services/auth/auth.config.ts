/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { baseUrl } from "@/config/api";

const axiosAdminConfig = axios.create({
  baseURL: baseUrl,
});

// Token refresh mechanism
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error?: any, token?: string) => {
  failedRequestsQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token!);
    }
  });
  failedRequestsQueue = [];
};

// Request interceptor
axiosAdminConfig.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Bagian yang perlu diperbaiki
axiosAdminConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error:", error);

    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosAdminConfig(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const response = await axios.post(`${baseUrl}/admin/refresh-token`, {
          refresh_token: refreshToken,
        });

        if (!response.data.data?.access_token) {
          throw new Error("Invalid refresh token response - no access_token");
        }

        const newAccessToken = response.data.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        axiosAdminConfig.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosAdminConfig(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        processQueue(refreshError, undefined);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
};

export default axiosAdminConfig;
