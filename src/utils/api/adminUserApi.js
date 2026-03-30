import axiosClient from "./axiosClient";

const adminUserApi = {
  createAdmin: (payload) => axiosClient.post("/api/admin/users/create-admin", payload),
  list: (params) => axiosClient.get("/api/admin/users", { params }),
  getById: (id) => axiosClient.get(`/api/admin/users/${id}`),
  updateStatus: (id, payload) =>
    axiosClient.patch(`/api/admin/users/${id}/status`, payload),
  resetPassword: (id, payload) =>
    axiosClient.post(`/api/admin/users/${id}/reset-password`, payload),
};

export default adminUserApi;
