import axiosInstance from "@/utils/axiosInstance";

export async function login(email, password) {
    try {
        const response = await axiosInstance.post("/auth/login", {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function register(name, email, password) {
    try {
        const response = await axiosInstance.post("/auth/register", {
            name,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
