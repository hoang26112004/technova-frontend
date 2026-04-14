import axiosClient from "./axiosClient";

const variantApi = {
  // Admin: create variant for a product (multipart: productId, price, stock, optional image)
  create: (formData) =>
    axiosClient.post("/api/v1/variants", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Admin: update variant (multipart: productId, price, stock, optional image)
  update: (id, formData) =>
    axiosClient.put(`/api/v1/variants/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Admin: delete variant
  remove: (id) => axiosClient.delete(`/api/v1/variants/${id}`),

  // Admin: upload/replace variant image only
  uploadImage: (id, formData) =>
    axiosClient.post(`/api/v1/variants/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getById: (id) => axiosClient.get(`/api/v1/variants/${id}`),
};

export default variantApi;
