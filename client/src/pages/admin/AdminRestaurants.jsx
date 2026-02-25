import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    createRestaurant,
    deleteRestaurant,
    getAllRestaurants,
    updateRestaurant,
} from "@/api/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function parsePhotoUrls(value) {
    return value
        .split("\n")
        .flatMap((line) => line.split(","))
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function AdminRestaurantsPage() {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [savingId, setSavingId] = useState("");
    const [deletingId, setDeletingId] = useState("");

    const [form, setForm] = useState({
        name: "",
        location: "",
        cuisine: "",
        priceRange: "",
        hours: "",
        photos: "",
    });

    useEffect(() => {
        async function fetchRestaurants() {
            try {
                const response = await getAllRestaurants({ page: 1, limit: 100 });
                const normalized = (Array.isArray(response?.data) ? response.data : []).map((restaurant) => ({
                    ...restaurant,
                    editing: false,
                    draftName: restaurant.name || "",
                    draftLocation: restaurant.location || "",
                    draftCuisine: restaurant.cuisine || "",
                    draftPriceRange: restaurant.priceRange || "",
                    draftHours: restaurant.hours || "",
                    draftPhotos: (restaurant.photos || []).join("\n"),
                }));
                setRestaurants(normalized);
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to fetch restaurants";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurants();
    }, []);

    const sortedRestaurants = useMemo(
        () => [...restaurants].sort((a, b) => a.name.localeCompare(b.name)),
        [restaurants],
    );

    async function handleCreate(event) {
        event.preventDefault();
        setSubmitting(true);

        try {
            const created = await createRestaurant({
                name: form.name.trim(),
                location: form.location.trim(),
                cuisine: form.cuisine.trim(),
                priceRange: form.priceRange.trim() || undefined,
                hours: form.hours.trim() || undefined,
                photos: parsePhotoUrls(form.photos),
            });

            if (created) {
                setRestaurants((prev) => [
                    ...prev,
                    {
                        ...created,
                        editing: false,
                        draftName: created.name || "",
                        draftLocation: created.location || "",
                        draftCuisine: created.cuisine || "",
                        draftPriceRange: created.priceRange || "",
                        draftHours: created.hours || "",
                        draftPhotos: (created.photos || []).join("\n"),
                    },
                ]);
            }

            setForm({
                name: "",
                location: "",
                cuisine: "",
                priceRange: "",
                hours: "",
                photos: "",
            });
            toast.success("Restaurant created successfully");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to create restaurant";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function toggleEdit(id, editing) {
        setRestaurants((prev) =>
            prev.map((restaurant) =>
                restaurant._id === id
                    ? {
                          ...restaurant,
                          editing,
                          draftName: restaurant.name || "",
                          draftLocation: restaurant.location || "",
                          draftCuisine: restaurant.cuisine || "",
                          draftPriceRange: restaurant.priceRange || "",
                          draftHours: restaurant.hours || "",
                          draftPhotos: (restaurant.photos || []).join("\n"),
                      }
                    : restaurant,
            ),
        );
    }

    function updateDraft(id, field, value) {
        setRestaurants((prev) =>
            prev.map((restaurant) =>
                restaurant._id === id
                    ? {
                          ...restaurant,
                          [field]: value,
                      }
                    : restaurant,
            ),
        );
    }

    async function handleSave(restaurant) {
        setSavingId(restaurant._id);

        try {
            const updated = await updateRestaurant(restaurant._id, {
                name: restaurant.draftName.trim(),
                location: restaurant.draftLocation.trim(),
                cuisine: restaurant.draftCuisine.trim(),
                priceRange: restaurant.draftPriceRange.trim() || undefined,
                hours: restaurant.draftHours.trim() || undefined,
                photos: parsePhotoUrls(restaurant.draftPhotos || ""),
            });

            setRestaurants((prev) =>
                prev.map((item) =>
                    item._id === restaurant._id
                        ? {
                              ...item,
                              ...(updated || {}),
                              editing: false,
                              draftName: updated?.name || restaurant.draftName,
                              draftLocation:
                                  updated?.location || restaurant.draftLocation,
                              draftCuisine: updated?.cuisine || restaurant.draftCuisine,
                              draftPriceRange:
                                  updated?.priceRange || restaurant.draftPriceRange,
                              draftHours: updated?.hours || restaurant.draftHours,
                              draftPhotos: (updated?.photos || []).join("\n"),
                          }
                        : item,
                ),
            );
            toast.success("Restaurant updated successfully");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to update restaurant";
            toast.error(message);
        } finally {
            setSavingId("");
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);

        try {
            await deleteRestaurant(id);
            setRestaurants((prev) => prev.filter((item) => item._id !== id));
            toast.success("Restaurant deleted successfully");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to delete restaurant";
            toast.error(message);
        } finally {
            setDeletingId("");
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4 max-w-5xl mx-auto">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="h-6 w-1/3 rounded bg-gray-200 animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-10 rounded bg-gray-200 animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Manage Restaurants</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/admin/assign-staff")}>
                            Assign Staff
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/admin")}>
                            Admin Home
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Restaurant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={form.location}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, location: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cuisine">Cuisine</Label>
                                <Input
                                    id="cuisine"
                                    value={form.cuisine}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, cuisine: event.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceRange">Price Range</Label>
                                <Input
                                    id="priceRange"
                                    placeholder="$, $$, $$$"
                                    value={form.priceRange}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, priceRange: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="hours">Hours</Label>
                                <Input
                                    id="hours"
                                    placeholder="10:00 AM - 10:00 PM"
                                    value={form.hours}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, hours: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="photos">Photo URLs</Label>
                                <textarea
                                    id="photos"
                                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="One URL per line (or comma separated)"
                                    value={form.photos}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, photos: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Creating..." : "Create Restaurant"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {sortedRestaurants.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No restaurants found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sortedRestaurants.map((restaurant) => (
                            <Card key={restaurant._id}>
                                <CardContent className="pt-6">
                                    {!restaurant.editing ? (
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-lg">{restaurant.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {restaurant.location} • {restaurant.cuisine}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {restaurant.priceRange || "N/A"}
                                                    {restaurant.hours ? ` • ${restaurant.hours}` : ""}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Photos: {restaurant.photos?.length || 0}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => toggleEdit(restaurant._id, true)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDelete(restaurant._id)}
                                                    disabled={deletingId === restaurant._id}
                                                >
                                                    {deletingId === restaurant._id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input
                                                    value={restaurant.draftName}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftName",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <Input
                                                    value={restaurant.draftLocation}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftLocation",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cuisine</Label>
                                                <Input
                                                    value={restaurant.draftCuisine}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftCuisine",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Price Range</Label>
                                                <Input
                                                    value={restaurant.draftPriceRange}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftPriceRange",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Hours</Label>
                                                <Input
                                                    value={restaurant.draftHours}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftHours",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Photo URLs</Label>
                                                <textarea
                                                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    placeholder="One URL per line (or comma separated)"
                                                    value={restaurant.draftPhotos || ""}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            restaurant._id,
                                                            "draftPhotos",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex gap-2">
                                                <Button
                                                    onClick={() => handleSave(restaurant)}
                                                    disabled={savingId === restaurant._id}
                                                >
                                                    {savingId === restaurant._id ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => toggleEdit(restaurant._id, false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
