import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
};

const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error?.response?.status === 401 &&
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
        if (!refreshPromise) {
          refreshPromise = axiosClient.post("/api/auth/refresh", {
            refreshToken,
          });
        }
        const refreshResponse = await refreshPromise;
        refreshPromise = null;
        const data = refreshResponse?.data?.data;
        if (!data?.accessToken) {
          clearAuthTokens();
          return Promise.reject(error);
        }
        storeAuthTokens(data);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
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
