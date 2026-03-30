import axiosClient from "./axiosClient";

const productApi = {
  getProducts: (params) => axiosClient.get("/api/v1/products", { params }),
  getById: (id) => axiosClient.get(`/api/v1/products/${id}`),
  search: (keyword) =>
    axiosClient.get("/api/v1/products/search", { params: { keyword } }),
  create: (formData) =>
    axiosClient.post("/api/v1/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    axiosClient.put(`/api/v1/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadImages: (id, formData) =>
    axiosClient.put(`/api/v1/products/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  toggleStatus: (id) => axiosClient.put(`/api/v1/products/${id}/status`),
};

export default productApi;
