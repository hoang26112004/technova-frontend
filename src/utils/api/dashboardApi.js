import axiosClient from "./axiosClient";

const dashboardApi = {
  getOverview: () => axiosClient.get("/api/admin/dashboard/overview"),
  getWeeklySalesByMonth: ({ year, month }) =>
    axiosClient.get("/api/admin/dashboard/weekly-sales", {
      params: { year, month },
    }),
};

export default dashboardApi;
