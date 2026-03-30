import axiosClient from "./axiosClient";

const orderApi = {
  create: (payload) => axiosClient.post("/api/v1/orders", payload),
  checkout: (payload) => axiosClient.post("/api/v1/orders/checkout", payload),
  getMyOrders: (params) =>
    axiosClient.get("/api/v1/orders/my-orders", { params }),
  getById: (id) => axiosClient.get(`/api/v1/orders/${id}`),
  getByReference: (reference) =>
    axiosClient.get(`/api/v1/orders/reference/${reference}`),
  adminGetAll: (params) =>
    axiosClient.get("/api/v1/orders/admin/all", { params }),
  changeStatus: (id, status) =>
    axiosClient.patch(`/api/v1/orders/${id}/status`, null, {
      params: { status },
    }),
};

export default orderApi;
