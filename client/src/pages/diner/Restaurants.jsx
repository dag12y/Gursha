import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Utensils, Clock } from "lucide-react";
import { toast } from "sonner";
import { getAllRestaurants } from "@/api/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RestaurantImageSlider from "@/components/RestaurantImageSlider";

export default function RestaurantsPage() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const data = await getAllRestaurants();
                setRestaurants(Array.isArray(data) ? data : []);
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to load restaurants";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden">
                            <div className="h-48 bg-gray-200 animate-pulse" />
                            <CardHeader>
                                <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-semibold">No restaurants found</h2>
                    <p className="text-muted-foreground mt-2">
                        Add restaurants from backend/admin and refresh.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Restaurants</h1>
                <p className="text-muted-foreground mt-1">
                    Browse available places and pick one to reserve later.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => {
                    return (
                        <Card
                            key={restaurant._id}
                            className="overflow-hidden flex flex-col"
                        >
                            <RestaurantImageSlider
                                photos={restaurant?.photos}
                                alt={restaurant.name || "Restaurant"}
                            />

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <CardTitle className="text-xl leading-tight">
                                        {restaurant.name}
                                    </CardTitle>
                                    {restaurant.priceRange ? (
                                        <Badge variant="secondary">
                                            {restaurant.priceRange}
                                        </Badge>
                                    ) : null}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{restaurant.location || "Location unavailable"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Utensils className="h-4 w-4" />
                                    <span>{restaurant.cuisine || "Cuisine unavailable"}</span>
                                </div>

                                {restaurant.hours ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{restaurant.hours}</span>
                                    </div>
                                ) : null}

                                {restaurant.menu?.length ? (
                                    <div className="pt-1">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Menu Highlights
                                        </p>
                                        <div className="space-y-1">
                                            {restaurant.menu.slice(0, 3).map((item, index) => (
                                                <p
                                                    key={`${restaurant._id}-menu-${index}`}
                                                    className="text-xs text-muted-foreground"
                                                >
                                                    {item.name} - ${Number(item.price || 0).toFixed(2)}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <Button
                                    className="w-full mt-4"
                                    onClick={() =>
                                        navigate(`/restaurants/${restaurant._id}/reserve`)
                                    }
                                >
                                    Reserve
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
