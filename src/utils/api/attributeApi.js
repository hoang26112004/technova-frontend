import axiosClient from "./axiosClient";

const attributeApi = {
  create: (variantId, payload) =>
    axiosClient.post(`/api/v1/attributes/${variantId}`, payload),
  getByVariant: (variantId) =>
    axiosClient.get(`/api/v1/attributes/variant/${variantId}`),
  update: (id, payload) => axiosClient.put(`/api/v1/attributes/${id}`, payload),
  remove: (id) => axiosClient.delete(`/api/v1/attributes/${id}`),
  search: (params) => axiosClient.get("/api/v1/attributes/search", { params }),
  getById: (id) => axiosClient.get(`/api/v1/attributes/${id}`),
};

export default attributeApi;
