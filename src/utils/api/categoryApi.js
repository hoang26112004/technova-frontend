import axiosClient from "./axiosClient";

const categoryApi = {
  getCategories: (params) => axiosClient.get("/api/v1/categories", { params }),
  getById: (id) => axiosClient.get(`/api/v1/categories/${id}`),
  create: (formData) =>
    axiosClient.post("/api/v1/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    axiosClient.put(`/api/v1/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadImage: (id, formData) =>
    axiosClient.put(`/api/v1/categories/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => axiosClient.delete(`/api/v1/categories/${id}`),
};

export default categoryApi;
