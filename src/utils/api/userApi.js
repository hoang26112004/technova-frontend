import axiosClient from "./axiosClient";

const userApi = {
  getMe: () => axiosClient.get("/api/v1/users/me"),
  updateMe: (payload, addressId) =>
    axiosClient.put("/api/v1/users", payload, {
      params: addressId ? { addressId } : undefined,
    }),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return axiosClient.put("/api/v1/users/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (payload) =>
    axiosClient.put("/api/v1/users/change-password", payload),
};

export default userApi;
