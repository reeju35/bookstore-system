import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// 🔥 Attach access token automatically
API.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (userInfo?.accessToken) {
    config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
  }

  return config;
});

// 🔥 Auto refresh token when access token expires
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        const { data } = await axios.post(
          "http://localhost:5000/api/refresh-token",
          {
            refreshToken: userInfo.refreshToken
          }
        );

        // Update access token
        userInfo.accessToken = data.accessToken;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return API(originalRequest);

      } catch (err) {
        // Refresh failed → logout
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;