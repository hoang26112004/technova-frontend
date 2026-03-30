import axiosClient from "./axiosClient";

const addressApi = {
  getOwn: () => axiosClient.get("/api/addresses"),
  create: (payload) => axiosClient.post("/api/addresses", payload),
  update: (id, payload) => axiosClient.put(`/api/addresses/${id}`, payload),
  remove: (id) => axiosClient.delete(`/api/addresses/${id}`),
};

export default addressApi;
