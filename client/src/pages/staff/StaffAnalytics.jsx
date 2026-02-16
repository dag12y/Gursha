import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, CalendarDays, ClipboardList, Table2 } from "lucide-react";
import { getReservationDashboardAnalytics } from "@/api/reservation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDay(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });
}

export default function StaffAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const data = await getReservationDashboardAnalytics();
                setAnalytics(data || null);
            } catch (error) {
                const message =
                    error?.response?.data?.message ||
                    "Failed to load dashboard analytics";
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    const reservationsByDate = useMemo(
        () => analytics?.reservationsByDate || [],
        [analytics],
    );
    const reservationsByStatus = useMemo(
        () => analytics?.reservationsByStatus || [],
        [analytics],
    );
    const mostBookedTables = useMemo(
        () => analytics?.mostBookedTables || [],
        [analytics],
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-1/3 rounded bg-gray-200 animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto p-8 text-center">
                    <h2 className="text-2xl font-semibold">No analytics available</h2>
                    <p className="text-muted-foreground mt-2">
                        Analytics data will appear when reservations are created.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Staff Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Total Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {analytics.totalReservations ?? 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Today Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {analytics.todayReservations ?? 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Last 7 Days Entries
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{reservationsByDate.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Reservations By Date (Last 7 days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reservationsByDate.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No data.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reservationsByDate.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>{formatDay(item._id)}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reservations By Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reservationsByStatus.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No data.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reservationsByStatus.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span>{item._id}</span>
                                            <span className="font-medium">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table2 className="h-4 w-4" />
                            Most Booked Tables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mostBookedTables.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No table stats yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {mostBookedTables.map((item) => (
                                    <div
                                        key={item.tableId}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span>{item.tableName || "Table"}</span>
                                        <span className="font-medium">{item.count} bookings</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
