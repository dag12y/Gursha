import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarDays, Clock3, Users, Table2, UserRound } from "lucide-react";
import {
    getRestaurantReservations,
    updateReservationStatus,
} from "@/api/reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Declined", "Seated", "Cancelled"];
const FILTER_OPTIONS = ["All", ...STATUS_OPTIONS];

function statusBadgeClass(status) {
    if (status === "Pending") {
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (status === "Confirmed") {
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (status === "Seated") {
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (status === "Declined") {
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
    if (status === "Cancelled") {
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
    return "bg-secondary text-secondary-foreground";
}

function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getActorName(actor) {
    if (!actor) {
        return "System";
    }
    if (typeof actor === "string") {
        return "User";
    }
    return actor.name || actor.email || "User";
}

export default function StaffReservationsPage() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        async function fetchReservations() {
            try {
                const data = await getRestaurantReservations();
                setReservations(Array.isArray(data) ? data : []);
            } catch (error) {
                if (error?.response?.status === 404) {
                    setReservations([]);
                    return;
                }

                const message =
                    error?.response?.data?.message ||
                    "Failed to fetch restaurant reservations";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchReservations();
    }, []);

    async function handleStatusChange(id, status) {
        setSavingId(id);

        try {
            const updated = await updateReservationStatus(id, status);
            setReservations((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? {
                              ...item,
                              status: updated?.status || status,
                          }
                        : item,
                ),
            );
            toast.success("Reservation status updated");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to update reservation status";
            toast.error(message);
        } finally {
            setSavingId("");
        }
    }

    const filteredReservations = useMemo(
        () =>
            reservations.filter((reservation) =>
                statusFilter === "All"
                    ? true
                    : reservation.status === statusFilter,
            ),
        [reservations, statusFilter],
    );

    const sortedReservations = useMemo(
        () =>
            [...filteredReservations].sort(
                (a, b) =>
                    new Date(b?.startTime).getTime() -
                    new Date(a?.startTime).getTime(),
            ),
        [filteredReservations],
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4 max-w-5xl mx-auto">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-16 bg-gray-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (sortedReservations.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-3xl mx-auto p-8 text-center">
                    <h2 className="text-2xl font-semibold">No reservations yet</h2>
                    <p className="text-muted-foreground mt-2">
                        Reservations for your restaurant will appear here.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Restaurant Reservations</h1>
                    <div className="flex gap-2 items-center">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            {FILTER_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline" onClick={() => navigate("/staff/tables")}>
                            Manage Tables
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/staff/analytics")}>
                            View Analytics
                        </Button>
                    </div>
                </div>

                {sortedReservations.map((reservation) => (
                    <Card key={reservation._id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <CardTitle className="text-lg">
                                    {reservation.user?.name || "Guest"}
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className={statusBadgeClass(reservation.status)}
                                >
                                    {reservation.status}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4" />
                                    <span>{reservation.user?.email || "No email"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Party size: {reservation.partySize}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{formatDateTime(reservation.startTime)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    <span>Ends: {formatDateTime(reservation.endTime)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Table2 className="h-4 w-4" />
                                    <span>
                                        {reservation.table?.name || "Table"}
                                        {reservation.table?.capacity
                                            ? ` (${reservation.table.capacity} seats)`
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            {reservation.statusHistory?.length ? (
                                <div className="pt-2">
                                    <p className="text-sm font-medium mb-2">Status Timeline</p>
                                    <div className="space-y-2">
                                        {[...reservation.statusHistory]
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.changedAt).getTime() -
                                                    new Date(a.changedAt).getTime(),
                                            )
                                            .map((entry, index) => (
                                                <div
                                                    key={`${entry.changedAt}-${index}`}
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    <span className="font-medium text-foreground">
                                                        {entry.status}
                                                    </span>
                                                    {" • "}
                                                    {formatDateTime(entry.changedAt)}
                                                    {" • "}
                                                    {getActorName(entry.changedBy)}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                <label
                                    htmlFor={`status-${reservation._id}`}
                                    className="text-sm text-muted-foreground"
                                >
                                    Update status
                                </label>
                                <select
                                    id={`status-${reservation._id}`}
                                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    value={reservation.status}
                                    disabled={savingId === reservation._id}
                                    onChange={(event) =>
                                        handleStatusChange(
                                            reservation._id,
                                            event.target.value,
                                        )
                                    }
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                {savingId === reservation._id ? (
                                    <Button disabled>Saving...</Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
