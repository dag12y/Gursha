import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    addMyRestaurantMenuItem,
    deleteMyRestaurantMenuItem,
    getMyRestaurantMenu,
    updateMyRestaurantMenuItem,
} from "@/api/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function StaffMenuPage() {
    const navigate = useNavigate();
    const [restaurantName, setRestaurantName] = useState("");
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [savingId, setSavingId] = useState("");
    const [deletingId, setDeletingId] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        async function fetchMenu() {
            try {
                const data = await getMyRestaurantMenu();
                setRestaurantName(data?.restaurantName || "");
                const normalized = (Array.isArray(data?.menu) ? data.menu : []).map((item) => ({
                    ...item,
                    editing: false,
                    draftName: item.name || "",
                    draftPrice: String(item.price ?? ""),
                    draftDescription: item.description || "",
                    draftImage: item.image || "",
                }));
                setMenu(normalized);
            } catch (error) {
                const message =
                    error?.response?.data?.message || "Failed to fetch menu";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchMenu();
    }, []);

    const sortedMenu = useMemo(
        () => [...menu].sort((a, b) => a.name.localeCompare(b.name)),
        [menu],
    );

    async function handleCreate(event) {
        event.preventDefault();
        setSubmitting(true);

        try {
            const created = await addMyRestaurantMenuItem({
                name: name.trim(),
                price: Number(price),
                description: description.trim() || undefined,
                image: image.trim() || undefined,
            });

            if (created) {
                setMenu((prev) => [
                    ...prev,
                    {
                        ...created,
                        editing: false,
                        draftName: created.name || "",
                        draftPrice: String(created.price ?? ""),
                        draftDescription: created.description || "",
                        draftImage: created.image || "",
                    },
                ]);
            }

            setName("");
            setPrice("");
            setDescription("");
            setImage("");
            toast.success("Menu item added");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to add menu item";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function toggleEdit(itemId, editing) {
        setMenu((prev) =>
            prev.map((item) =>
                item._id === itemId
                    ? {
                          ...item,
                          editing,
                          draftName: item.name || "",
                          draftPrice: String(item.price ?? ""),
                          draftDescription: item.description || "",
                          draftImage: item.image || "",
                      }
                    : item,
            ),
        );
    }

    function updateDraft(itemId, field, value) {
        setMenu((prev) =>
            prev.map((item) =>
                item._id === itemId
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item,
            ),
        );
    }

    async function handleSave(item) {
        setSavingId(item._id);

        try {
            const updated = await updateMyRestaurantMenuItem(item._id, {
                name: item.draftName.trim(),
                price: Number(item.draftPrice),
                description: item.draftDescription.trim() || undefined,
                image: item.draftImage.trim() || undefined,
            });

            setMenu((prev) =>
                prev.map((entry) =>
                    entry._id === item._id
                        ? {
                              ...entry,
                              ...(updated || {}),
                              editing: false,
                              draftName: updated?.name || item.draftName,
                              draftPrice: String(updated?.price ?? item.draftPrice),
                              draftDescription:
                                  updated?.description || item.draftDescription,
                              draftImage: updated?.image || item.draftImage,
                          }
                        : entry,
                ),
            );

            toast.success("Menu item updated");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to update menu item";
            toast.error(message);
        } finally {
            setSavingId("");
        }
    }

    async function handleDelete(itemId) {
        setDeletingId(itemId);

        try {
            await deleteMyRestaurantMenuItem(itemId);
            setMenu((prev) => prev.filter((item) => item._id !== itemId));
            toast.success("Menu item deleted");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Failed to delete menu item";
            toast.error(message);
        } finally {
            setDeletingId("");
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4 max-w-4xl mx-auto">
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
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Menu Management</h1>
                        {restaurantName ? (
                            <p className="text-sm text-muted-foreground mt-1">
                                {restaurantName}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/staff/tables")}>
                            Manage Tables
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/staff/reservations")}
                        >
                            Manage Reservations
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Menu Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="menu-name">Name</Label>
                                <Input
                                    id="menu-name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="menu-price">Price</Label>
                                <Input
                                    id="menu-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(event) => setPrice(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="menu-description">Description</Label>
                                <Input
                                    id="menu-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="menu-image">Image URL</Label>
                                <Input
                                    id="menu-image"
                                    value={image}
                                    onChange={(event) => setImage(event.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Adding..." : "Add Item"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {sortedMenu.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No menu items yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sortedMenu.map((item) => (
                            <Card key={item._id}>
                                <CardContent className="pt-6">
                                    {!item.editing ? (
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div className="space-y-1 flex-1">
                                                <p className="font-semibold text-lg">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ${Number(item.price || 0).toFixed(2)}
                                                </p>
                                                {item.description ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            {item.image ? (
                                                <ImageWithFallback
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-20 w-28 rounded-md object-cover"
                                                />
                                            ) : null}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => toggleEdit(item._id, true)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                >
                                                    {deletingId === item._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input
                                                    value={item.draftName}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            item._id,
                                                            "draftName",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Price</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.draftPrice}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            item._id,
                                                            "draftPrice",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={item.draftDescription}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            item._id,
                                                            "draftDescription",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Image URL</Label>
                                                <Input
                                                    value={item.draftImage || ""}
                                                    onChange={(event) =>
                                                        updateDraft(
                                                            item._id,
                                                            "draftImage",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex gap-2">
                                                <Button
                                                    onClick={() => handleSave(item)}
                                                    disabled={savingId === item._id}
                                                >
                                                    {savingId === item._id ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => toggleEdit(item._id, false)}
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
