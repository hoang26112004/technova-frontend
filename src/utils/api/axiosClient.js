import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

const storeAuthTokens = (data) => {
  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken;
  const expiresIn = data?.expiresIn;
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  if (expiresIn) {
    const expiresAt = Date.now() + Number(expiresIn) * 1000;
    localStorage.setItem("accessTokenExpiresAt", String(expiresAt));
  }
  try {
    window.dispatchEvent(new CustomEvent("auth:changed"));
  } catch {
    // Ignore non-browser environments.
  }
};

const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
  try {
    window.dispatchEvent(new CustomEvent("auth:changed"));
  } catch {
    // Ignore non-browser environments.
  }
};

const getExpiresAt = () => Number(localStorage.getItem("accessTokenExpiresAt") || 0);

const shouldRefreshSoon = () => {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return false;
  return Date.now() >= expiresAt - 30000;
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }
  if (!refreshPromise) {
    refreshPromise = axios.post(`${baseURL}/api/auth/refresh`, {
      refreshToken,
    });
  }
  const refreshResponse = await refreshPromise;
  refreshPromise = null;
  const data = refreshResponse?.data?.data;
  if (!data?.accessToken) {
    clearAuthTokens();
    throw new Error("Refresh failed");
  }
  storeAuthTokens(data);
  return data.accessToken;
};

axiosClient.interceptors.request.use(async (config) => {
  if (!config?.url?.includes("/api/auth/refresh")) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken && shouldRefreshSoon()) {
      try {
        const newAccessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return config;
      } catch (error) {
        clearAuthTokens();
      }
    }
  }
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error?.response?.status === 401 ||
        (error?.response?.status === 403 && shouldRefreshSoon())) &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAuthTokens();
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
