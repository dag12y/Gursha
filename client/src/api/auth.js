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

export async function assignStaffRole(userId, restaurantId) {
    const response = await axiosInstance.put(`/auth/assign-staff/${userId}`, {
        restaurantId,
    });
    return response.data?.user ?? null;
}

export async function getAllUsers() {
    const response = await axiosInstance.get("/auth/users");
    return response.data?.users ?? [];
}

export async function verifyEmail(email, token) {
    const response = await axiosInstance.post("/auth/verify-email", {
        email,
        token,
    });
    return response.data;
}

export async function resendVerificationEmail(email) {
    const response = await axiosInstance.post("/auth/resend-verification", {
        email,
    });
    return response.data;
}
