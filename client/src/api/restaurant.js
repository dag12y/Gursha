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

export async function getMyRestaurantMenu() {
    const response = await axiosInstance.get("/restaurants/menu/my");
    return response.data;
}

export async function addMyRestaurantMenuItem(payload) {
    const response = await axiosInstance.post("/restaurants/menu/my", payload);
    return response.data?.item ?? null;
}

export async function updateMyRestaurantMenuItem(itemId, payload) {
    const response = await axiosInstance.put(
        `/restaurants/menu/my/${itemId}`,
        payload,
    );
    return response.data?.item ?? null;
}

export async function deleteMyRestaurantMenuItem(itemId) {
    const response = await axiosInstance.delete(`/restaurants/menu/my/${itemId}`);
    return response.data;
}
