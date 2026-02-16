import axiosInstance from "@/utils/axiosInstance";

export async function getAllRestaurants() {
    const response = await axiosInstance.get("/restaurants");
    return response.data?.data ?? [];
}

export async function getRestaurantById(id) {
    const response = await axiosInstance.get(`/restaurants/${id}`);
    return response.data?.data ?? null;
}
