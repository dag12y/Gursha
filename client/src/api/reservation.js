import axiosInstance from "@/utils/axiosInstance";

export async function createReservation(payload) {
    const response = await axiosInstance.post("/reservations", payload);
    return response.data;
}
