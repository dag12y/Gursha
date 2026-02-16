import { useEffect, useState } from "react";
import { toast } from "sonner";
import { assignStaffRole } from "@/api/auth";
import { getAllRestaurants } from "@/api/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminAssignStaffPage() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [userId, setUserId] = useState("");
    const [restaurantId, setRestaurantId] = useState("");

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const data = await getAllRestaurants();
                setRestaurants(Array.isArray(data) ? data : []);
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to fetch restaurants";
                toast.error(message);
            } finally {
                setLoadingRestaurants(false);
            }
        }

        fetchRestaurants();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);

        try {
            await assignStaffRole(userId.trim(), restaurantId);
            toast.success("User assigned as staff successfully");
            setUserId("");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to assign staff role";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Assign Staff</h1>
                    <Button variant="outline" onClick={() => navigate("/admin/restaurants")}>
                        Manage Restaurants
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Promote User To Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="userId">User ID</Label>
                                <Input
                                    id="userId"
                                    placeholder="MongoDB user id"
                                    value={userId}
                                    onChange={(event) => setUserId(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="restaurantId">Restaurant</Label>
                                <select
                                    id="restaurantId"
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={restaurantId}
                                    onChange={(event) => setRestaurantId(event.target.value)}
                                    required
                                    disabled={loadingRestaurants}
                                >
                                    <option value="">Select a restaurant</option>
                                    {restaurants.map((restaurant) => (
                                        <option key={restaurant._id} value={restaurant._id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" disabled={submitting || loadingRestaurants}>
                                {submitting ? "Assigning..." : "Assign Staff Role"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
