/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { baseUrl } from "@/config/api";

const axiosUserConfig = axios.create({
  baseURL: baseUrl,
});

// === Refresh Token Mechanism ===
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

// === Request Interceptor ===
axiosUserConfig.interceptors.request.use(
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

// === Response Interceptor ===
axiosUserConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return Promise.reject(error); 
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosUserConfig(originalRequest));
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
        const response = await axios.post(`${baseUrl}/user/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data?.data?.access_token;
        if (!newAccessToken) {
          throw new Error("Invalid refresh token response - no access_token");
        }

        localStorage.setItem("access_token", newAccessToken);
        axiosUserConfig.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return axiosUserConfig(originalRequest);
      } catch (refreshError: any) {
        console.error("Refresh token failed:", refreshError);

        processQueue(refreshError, undefined);

        // Hanya logout jika refresh token benar-benar tidak valid
        if (
          refreshError?.response?.status === 401 ||
          refreshError?.response?.status === 403
        ) {
          logout();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// === Logout Handler ===
const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
};

export default axiosUserConfig;
