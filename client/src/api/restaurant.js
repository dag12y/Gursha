import axiosInstance from "@/utils/axiosInstance";

export async function getAllRestaurants() {
    try {
        const response = await axiosInstance.get("/restaurants");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getRestaurantById(id) {
    try {
        const response = await axiosInstance.get(`/restaurants/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
