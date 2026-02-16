import axiosInstance from "@/utils/axiosInstance";

export async function getAllRestaurants() {
    const response = await axiosInstance.get("/restaurants");
    return response.data?.data ?? [];
}

export async function getRestaurantById(id) {
    const response = await axiosInstance.get(`/restaurants/${id}`);
    return response.data?.data ?? null;
}

export async function createRestaurant(payload) {
    const response = await axiosInstance.post("/restaurants", payload);
    return response.data?.restaurant ?? null;
}

export async function updateRestaurant(id, payload) {
    const response = await axiosInstance.put(`/restaurants/${id}`, payload);
    return response.data?.restaurant ?? null;
}

export async function deleteRestaurant(id) {
    const response = await axiosInstance.delete(`/restaurants/${id}`);
    return response.data;
}
