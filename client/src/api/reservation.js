import axiosInstance from "@/utils/axiosInstance";

export async function createReservation(payload) {
    const response = await axiosInstance.post("/reservations", payload);
    return response.data;
}

export async function getMyReservations() {
    const response = await axiosInstance.get("/reservations/my");
    return response.data?.reservations ?? [];
}

export async function cancelReservation(id) {
    const response = await axiosInstance.put(`/reservations/cancel/${id}`);
    return response.data;
}
