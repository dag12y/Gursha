import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function StaffHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Staff Dashboard</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Access Confirmed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Logged in as <span className="font-medium text-foreground">{user?.name || "Staff"}</span>
                        </p>
                        <p>
                            Role: <span className="font-medium text-foreground capitalize">{user?.role || "staff"}</span>
                        </p>
                        <p>Next step: build reservation management and analytics here.</p>
                        <div className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => navigate("/staff/reservations")}>
                                    Manage Reservations
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/staff/analytics")}
                                >
                                    View Analytics
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
