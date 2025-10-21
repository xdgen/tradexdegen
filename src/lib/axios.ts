import Axios from "axios";

const baseURL = `${import.meta.env.VITE_BASE_API_URL}`;

const axiosAsync = Axios.create({
  baseURL,
  withCredentials: true,
});

const axios = Axios.create({
  baseURL,
  withCredentials: true,
});

axiosAsync.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const parsedAuthData = JSON.parse(authData as string) as AuthResponse;

      const token = parsedAuthData.token.accessToken;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

const handleAuthError = (error: any) => {
  const message =
    error.response?.data?.message?.toLowerCase() ||
    error.message?.toLowerCase();
  console.log(message, "interceptor error");

  if (message.includes("invalid token")) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return Promise.reject(error);
};

axios.interceptors.response.use((r) => r, handleAuthError);
axiosAsync.interceptors.response.use((r) => r, handleAuthError);

export { axios, axiosAsync };
