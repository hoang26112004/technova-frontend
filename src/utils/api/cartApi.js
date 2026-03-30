import axiosClient from "./axiosClient";

const cartApi = {
  getCart: () => axiosClient.get("/api/v1/carts"),
  addItem: (variantId, quantity = 1) =>
    axiosClient.post("/api/v1/carts/add", { variantId, quantity }),
  updateItem: (variantId, qty) =>
    axiosClient.patch(`/api/v1/carts/${variantId}`, null, { params: { qty } }),
  removeItem: (variantId) => axiosClient.delete(`/api/v1/carts/${variantId}`),
};

export default cartApi;
