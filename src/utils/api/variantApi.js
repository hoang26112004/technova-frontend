import axiosClient from "./axiosClient";

const variantApi = {
  getById: (id) => axiosClient.get(`/api/v1/variants/${id}`),
};

export default variantApi;

