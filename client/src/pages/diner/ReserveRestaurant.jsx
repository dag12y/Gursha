import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getRestaurantById } from "@/api/restaurant";
import { createReservation, getAvailableTimeSlots } from "@/api/reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function ReserveRestaurantPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    const [date, setDate] = useState(today);
    const [time, setTime] = useState("");
    const [partySize, setPartySize] = useState(2);

    useEffect(() => {
        async function fetchRestaurant() {
            try {
                const data = await getRestaurantById(id);
                setRestaurant(data);
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to load restaurant";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchRestaurant();
        } else {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        async function fetchAvailableSlots() {
            if (!id || !date || Number(partySize) < 1) {
                setAvailableSlots([]);
                setTime("");
                return;
            }

            setLoadingSlots(true);
            try {
                const slots = await getAvailableTimeSlots(id, date, Number(partySize));
                setAvailableSlots(slots);

                if (!slots.length) {
                    setTime("");
                    return;
                }

                const hasCurrentSelection = slots.some((slot) => slot.time === time);
                if (!hasCurrentSelection) {
                    setTime(slots[0].time);
                }
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to load available time slots";
                toast.error(message);
                setAvailableSlots([]);
                setTime("");
            } finally {
                setLoadingSlots(false);
            }
        }

        fetchAvailableSlots();
    }, [id, date, partySize, time]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!time) {
            toast.error("Please select an available time slot");
            return;
        }

        setSubmitting(true);
        try {
            await createReservation({
                restaurant: id,
                date,
                time,
                partySize: Number(partySize),
            });

            toast.success("Reservation created successfully");
            navigate("/restaurants");
        } catch (error) {
            const apiMessage = error?.response?.data?.message;
            const validationError = error?.response?.data?.errors?.[0]?.msg;
            toast.error(apiMessage || validationError || "Failed to create reservation");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-lg mx-auto">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-40 bg-gray-200 animate-pulse rounded" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-lg mx-auto p-8 text-center">
                    <h2 className="text-2xl font-semibold">Restaurant not found</h2>
                    <Button className="mt-4" onClick={() => navigate("/restaurants")}>
                        Back to restaurants
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle>Reserve at {restaurant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {restaurant.location} • {restaurant.cuisine}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Full Menu</p>
                            {restaurant.menu?.length ? (
                                <div className="space-y-3">
                                    {restaurant.menu.map((item, index) => (
                                        <div
                                            key={`${restaurant._id}-menu-item-${index}`}
                                            className="flex items-start justify-between gap-3 text-sm"
                                        >
                                            <div className="flex items-start gap-3">
                                                {item.image ? (
                                                    <ImageWithFallback
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-16 w-16 rounded-md object-cover"
                                                    />
                                                ) : null}
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.description ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium">
                                                ${Number(item.price || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Menu is not available yet.
                                </p>
                            )}
                        </div>

                        <Separator className="lg:hidden" />
                        <Separator orientation="vertical" className="hidden lg:block h-full" />

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    min={today}
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <select
                                    id="time"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={time}
                                    onChange={(event) => setTime(event.target.value)}
                                    required
                                    disabled={loadingSlots || !availableSlots.length}
                                >
                                    {!availableSlots.length ? (
                                        <option value="">
                                            {loadingSlots
                                                ? "Loading slots..."
                                                : "No available slots"}
                                        </option>
                                    ) : (
                                        availableSlots.map((slot) => (
                                            <option key={slot.time} value={slot.time}>
                                                {slot.time} ({slot.availableTables} table
                                                {slot.availableTables === 1 ? "" : "s"} available)
                                            </option>
                                        ))
                                    )}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Showing available slots for selected date and party size.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="partySize">Party size</Label>
                                <Input
                                    id="partySize"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={partySize}
                                    onChange={(event) => setPartySize(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => navigate("/restaurants")}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={submitting}>
                                    {submitting ? "Creating..." : "Confirm Reservation"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
