export const RESERVATION_STATUSES = Object.freeze([
    "Pending",
    "Confirmed",
    "Declined",
    "Seated",
    "Cancelled",
]);

export const ACTIVE_RESERVATION_STATUSES = Object.freeze([
    "Pending",
    "Confirmed",
    "Seated",
]);

export const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
    Pending: ["Confirmed", "Declined", "Cancelled"],
    Confirmed: ["Seated", "Declined", "Cancelled"],
    Declined: [],
    Seated: [],
    Cancelled: [],
});

export const DINER_CANCELLABLE_STATUSES = Object.freeze([
    "Pending",
    "Confirmed",
]);

export function canTransitionReservationStatus(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
        return true;
    }

    return ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
}
