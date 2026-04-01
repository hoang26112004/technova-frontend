import axiosClient from "./axiosClient";

const variantApi = {
  create: (formData) =>
    axiosClient.post("/api/v1/variants", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    axiosClient.put(`/api/v1/variants/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => axiosClient.delete(`/api/v1/variants/${id}`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append("image", file);
    return axiosClient.post(`/api/v1/variants/${id}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getById: (id) => axiosClient.get(`/api/v1/variants/${id}`),
};

export default variantApi;
