import axiosClient from "./axiosClient";

const authApi = {
  login: (payload) => axiosClient.post("/api/auth/login", payload),
  googleLogin: () => axiosClient.get("/api/auth/login"),
  register: (payload) => axiosClient.post("/api/auth/register", payload),
};

export default authApi;
