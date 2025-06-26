import axios from "axios";
const baseUrl = "https://plants-biologies.onrender.com/api/";

const config = {
  baseURL: baseUrl,
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;
// handle before call API
const handleBefore = (config) => {
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
};

api.interceptors.request.use(handleBefore, null);

export default api;
