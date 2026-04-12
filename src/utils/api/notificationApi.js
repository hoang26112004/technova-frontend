import axiosClient from "./axiosClient";

const notificationApi = {
  getNotifications: (params) =>
    axiosClient.get("/api/v1/notifications", { params }),
  getUnreadCount: () => axiosClient.get("/api/v1/notifications/unread-count"),
  markRead: (id) => axiosClient.put(`/api/v1/notifications/${id}/read`),
  markAllRead: () => axiosClient.put("/api/v1/notifications/read-all"),
};

export default notificationApi;

