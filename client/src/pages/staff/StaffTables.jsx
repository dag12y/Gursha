import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Table2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    createTable,
    deleteTable,
    getTablesByRestaurant,
    updateTable,
} from "@/api/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const TABLE_STATUS_OPTIONS = ["Available", "Reserved", "Occupied", "Finishing Up"];

export default function StaffTablesPage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [restaurantId, setRestaurantId] = useState(user?.restaurant || "");
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [savingId, setSavingId] = useState("");
    const [deletingId, setDeletingId] = useState("");

    const [newName, setNewName] = useState("");
    const [newCapacity, setNewCapacity] = useState("");

    useEffect(() => {
        if (user?.restaurant) {
            setRestaurantId(user.restaurant);
            return;
        }

        refreshUser()
            .then((currentUser) => {
                setRestaurantId(currentUser?.restaurant || "");
            })
            .catch(() => {
                setRestaurantId("");
            });
    }, [user, refreshUser]);

    useEffect(() => {
        async function fetchTables() {
            if (!restaurantId) {
                setLoading(false);
                return;
            }

            try {
                const data = await getTablesByRestaurant(restaurantId);
                const normalized = (Array.isArray(data) ? data : []).map((table) => ({
                    ...table,
                    editing: false,
                    draftName: table.name,
                    draftCapacity: String(table.capacity),
                    draftStatus: table.status || "Available",
                }));
                setTables(normalized);
            } catch (error) {
                const message =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Failed to fetch tables";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchTables();
    }, [restaurantId]);

    const sortedTables = useMemo(
        () => [...tables].sort((a, b) => a.name.localeCompare(b.name)),
        [tables],
    );

    async function handleCreateTable(event) {
        event.preventDefault();

        if (!restaurantId) {
            toast.error("No restaurant assigned for this staff account.");
            return;
        }

        setSubmitting(true);
        try {
            const created = await createTable({
                restaurant: restaurantId,
                name: newName.trim(),
                capacity: Number(newCapacity),
            });

            if (created) {
                setTables((prev) => [
                    ...prev,
                    {
                        ...created,
                        editing: false,
                        draftName: created.name,
                        draftCapacity: String(created.capacity),
                        draftStatus: created.status || "Available",
                    },
                ]);
            }

            setNewName("");
            setNewCapacity("");
            toast.success("Table created successfully");
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.errors?.[0]?.msg ||
                "Failed to create table";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function toggleEdit(tableId, editing) {
        setTables((prev) =>
            prev.map((table) =>
                table._id === tableId
                    ? {
                          ...table,
                          editing,
                          draftName: table.name,
                          draftCapacity: String(table.capacity),
                          draftStatus: table.status || "Available",
                      }
                    : table,
            ),
        );
    }

    function updateDraft(tableId, field, value) {
        setTables((prev) =>
            prev.map((table) =>
                table._id === tableId
                    ? {
                          ...table,
                          [field]: value,
                      }
                    : table,
            ),
        );
    }

    async function handleSave(table) {
        setSavingId(table._id);

        try {
            const updated = await updateTable(table._id, {
                name: table.draftName.trim(),
                capacity: Number(table.draftCapacity),
                status: table.draftStatus,
            });

            setTables((prev) =>
                prev.map((item) =>
                    item._id === table._id
                        ? {
                              ...item,
                              ...(updated || {}),
                              editing: false,
                              draftName: (updated?.name || table.draftName).trim(),
                              draftCapacity: String(
                                  updated?.capacity ?? Number(table.draftCapacity),
                              ),
                              draftStatus: updated?.status || table.draftStatus,
                          }
                        : item,
                ),
            );

            toast.success("Table updated successfully");
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update table";
            toast.error(message);
        } finally {
            setSavingId("");
        }
    }

    async function handleDelete(tableId) {
        setDeletingId(tableId);

        try {
            await deleteTable(tableId);
            setTables((prev) => prev.filter((table) => table._id !== tableId));
            toast.success("Table deleted successfully");
        } catch (error) {
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to delete table";
            toast.error(message);
        } finally {
            setDeletingId("");
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4 max-w-5xl mx-auto">
                    {Array.from({ length: 4 }).map((_, index) => (
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
                    <h1 className="text-3xl font-bold">Table Management</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/staff/reservations")}>
                            Reservations
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/staff/analytics")}>
                            Analytics
                        </Button>
                    </div>
                </div>

                {!restaurantId ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">
                                Your account is not assigned to a restaurant yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Table
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleCreateTable}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Table Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Table 1"
                                            value={newName}
                                            onChange={(event) => setNewName(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            min="1"
                                            placeholder="4"
                                            value={newCapacity}
                                            onChange={(event) => setNewCapacity(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" className="w-full" disabled={submitting}>
                                            {submitting ? "Creating..." : "Create Table"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            {sortedTables.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center">
                                        <p className="text-muted-foreground">No tables found.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                sortedTables.map((table) => (
                                    <Card key={table._id}>
                                        <CardContent className="pt-6 space-y-4">
                                            {!table.editing ? (
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Table2 className="h-4 w-4 text-muted-foreground" />
                                                            <p className="font-semibold">{table.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Users className="h-4 w-4" />
                                                            <span>Capacity: {table.capacity}</span>
                                                            <span>•</span>
                                                            <span>Status: {table.status}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => toggleEdit(table._id, true)}
                                                        >
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleDelete(table._id)}
                                                            disabled={deletingId === table._id}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {deletingId === table._id ? "Deleting..." : "Delete"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Table Name</Label>
                                                        <Input
                                                            value={table.draftName}
                                                            onChange={(event) =>
                                                                updateDraft(
                                                                    table._id,
                                                                    "draftName",
                                                                    event.target.value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Capacity</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={table.draftCapacity}
                                                            onChange={(event) =>
                                                                updateDraft(
                                                                    table._id,
                                                                    "draftCapacity",
                                                                    event.target.value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Status</Label>
                                                        <select
                                                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                                            value={table.draftStatus}
                                                            onChange={(event) =>
                                                                updateDraft(
                                                                    table._id,
                                                                    "draftStatus",
                                                                    event.target.value,
                                                                )
                                                            }
                                                        >
                                                            {TABLE_STATUS_OPTIONS.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex items-end gap-2">
                                                        <Button
                                                            onClick={() => handleSave(table)}
                                                            disabled={savingId === table._id}
                                                        >
                                                            {savingId === table._id ? "Saving..." : "Save"}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => toggleEdit(table._id, false)}
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
                    </>
                )}
            </div>
        </div>
    );
}
