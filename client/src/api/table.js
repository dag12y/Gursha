import axiosInstance from "@/utils/axiosInstance";

export async function getTablesByRestaurant(restaurantId) {
    const response = await axiosInstance.get(`/tables/${restaurantId}`);
    return response.data?.tables ?? [];
}

export async function createTable(payload) {
    const response = await axiosInstance.post("/tables", payload);
    return response.data?.table ?? null;
}

export async function updateTable(id, payload) {
    const response = await axiosInstance.put(`/tables/${id}`, payload);
    return response.data?.table ?? null;
}

export async function deleteTable(id) {
    const response = await axiosInstance.delete(`/tables/${id}`);
    return response.data;
}
