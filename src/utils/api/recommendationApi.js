import axiosClient from "./axiosClient";

const recommendationApi = {
  home: () => axiosClient.get("/api/v1/recommendations/home"),
};

export default recommendationApi;
