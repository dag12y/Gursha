import axiosInstance from "@/utils/axiosInstance";

export async function createReservation(payload) {
    const response = await axiosInstance.post("/reservations", payload);
    return response.data;
}

export async function getAvailableTimeSlots(restaurant, date, partySize) {
    const response = await axiosInstance.get("/reservations/availability", {
        params: {
            restaurant,
            date,
            partySize,
        },
    });
    return response.data?.slots ?? [];
}

export async function getMyReservations(params = {}) {
    const response = await axiosInstance.get("/reservations/my", { params });
    return response.data?.reservations ?? [];
}

export async function cancelReservation(id) {
    const response = await axiosInstance.put(`/reservations/cancel/${id}`);
    return response.data;
}

export async function getRestaurantReservations(params = {}) {
    const response = await axiosInstance.get("/reservations/restaurant", {
        params,
    });
    return response.data?.reservations ?? [];
}

export async function updateReservationStatus(id, status) {
    const response = await axiosInstance.put(`/reservations/status/${id}`, {
        status,
    });
    return response.data?.reservation ?? null;
}

export async function getReservationDashboardAnalytics() {
    const response = await axiosInstance.get("/reservations/restaurant/dashboard");
    return response.data;
}
