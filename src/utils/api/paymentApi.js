import axiosClient from "./axiosClient";

const paymentApi = {
  createVnpayLink: (orderReference) =>
    axiosClient.get("/api/v1/payment/vnpay", {
      params: { orderReference },
    }),
};

export default paymentApi;
