import axiosClient from "./axiosClient";

const dashboardApi = {
  getOverview: () => axiosClient.get("/api/admin/dashboard/overview"),
};

export default dashboardApi;

