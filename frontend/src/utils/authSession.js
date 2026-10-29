import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";
const REFRESH_URL = `${API_URL}/api/users/auth/refresh`;
const excludedPaths = [
  "/api/users/login",
  "/api/users/register",
  "/api/users/auth/refresh",
  "/api/users/auth/logout",
];

axios.defaults.withCredentials = true;

let refreshRequest = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const status = error.response?.status;
    const requestUrl = request?.url || "";
    const isApiRequest =
      (API_URL && requestUrl.startsWith(API_URL)) ||
      requestUrl.startsWith("/api/");

    if (
      status !== 401 ||
      !request ||
      request._retriedAfterRefresh ||
      !isApiRequest ||
      excludedPaths.some((path) => requestUrl.includes(path))
    ) {
      return Promise.reject(error);
    }

    request._retriedAfterRefresh = true;
    try {
      if (!refreshRequest) {
        refreshRequest = axios.post(REFRESH_URL, {});
      }
      await refreshRequest;
      return axios(request);
    } catch (refreshError) {
      if ([401, 403].includes(refreshError.response?.status)) {
        localStorage.removeItem("userInfo");
        window.dispatchEvent(new Event("auth:expired"));
      }
      return Promise.reject(error);
    } finally {
      refreshRequest = null;
    }
  }
);
