import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getRestaurantById } from "@/api/restaurant";
import { createReservation } from "@/api/reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ReserveRestaurantPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    const [date, setDate] = useState(today);
    const [time, setTime] = useState("19:00");
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

    async function handleSubmit(event) {
        event.preventDefault();

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
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>Reserve at {restaurant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {restaurant.location} • {restaurant.cuisine}
                    </p>
                </CardHeader>
                <CardContent>
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
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                required
                            />
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
                </CardContent>
            </Card>
        </div>
    );
}
