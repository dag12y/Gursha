import axios from "axios";
import { getToken } from "./auth";

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
