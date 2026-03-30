import axiosClient from "./axiosClient";

const reviewApi = {
  getByProduct: (productId) =>
    axiosClient.get(`/api/v1/reviews/product/${productId}`),
  create: (payload) => axiosClient.post("/api/v1/reviews", payload),
  remove: (id) => axiosClient.delete(`/api/v1/reviews/${id}`),
};

export default reviewApi;
