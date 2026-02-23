import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Clock3, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cancelReservation, getMyReservations } from "@/api/reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

function isCancelable(status) {
    return ["Pending", "Confirmed"].includes(status);
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

export default function MyReservationsPage() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState("");

    useEffect(() => {
        async function fetchReservations() {
            try {
                const data = await getMyReservations();
                setReservations(Array.isArray(data) ? data : []);
            } catch (error) {
                if (error?.response?.status === 404) {
                    setReservations([]);
                    return;
                }

                const message =
                    error?.response?.data?.message || "Failed to fetch reservations";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchReservations();
    }, []);

    async function handleCancel(id) {
        setCancelingId(id);

        try {
            await cancelReservation(id);
            setReservations((prev) =>
                prev.map((item) =>
                    item._id === id
                        ? {
                              ...item,
                              status: "Cancelled",
                              statusHistory: [
                                  ...(item.statusHistory || []),
                                  {
                                      status: "Cancelled",
                                      changedAt: new Date().toISOString(),
                                      changedBy: "You",
                                  },
                              ],
                          }
                        : item,
                ),
            );
            toast.success("Reservation canceled successfully");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to cancel reservation";
            toast.error(message);
        } finally {
            setCancelingId("");
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4 max-w-3xl mx-auto">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
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

    if (reservations.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto p-8 text-center">
                    <h2 className="text-2xl font-semibold">No reservations yet</h2>
                    <p className="text-muted-foreground mt-2">
                        You can create one from the restaurants page.
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/restaurants")}>
                        Browse restaurants
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">My Reservations</h1>

                <div className="space-y-4">
                    {reservations.map((reservation) => (
                        <Card key={reservation._id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <CardTitle className="text-xl">
                                        {reservation.restaurant?.name || "Restaurant"}
                                    </CardTitle>
                                    <Badge variant="secondary">{reservation.status}</Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{formatDateTime(reservation.startTime)}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock3 className="h-4 w-4" />
                                    <span>Ends at {formatDateTime(reservation.endTime)}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Party size: {reservation.partySize}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        Table: {reservation.table?.name || "Assigned"}
                                        {reservation.table?.capacity
                                            ? ` (${reservation.table.capacity} seats)`
                                            : ""}
                                    </span>
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

                                {isCancelable(reservation.status) ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleCancel(reservation._id)}
                                        disabled={cancelingId === reservation._id}
                                    >
                                        {cancelingId === reservation._id
                                            ? "Canceling..."
                                            : "Cancel Reservation"}
                                    </Button>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
