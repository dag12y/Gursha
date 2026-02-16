import axiosInstance from "@/utils/axiosInstance";

export async function login(email, password) {
    const response = await axiosInstance.post("/auth/login", {
        email,
        password,
    });
    return response.data?.data ?? response.data;
}

export async function register(name, email, password) {
    const response = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
    });
    return response.data?.data ?? response.data;
}

export async function getCurrentUser() {
    const response = await axiosInstance.get("/auth/me");
    return response.data?.data ?? response.data;
}
