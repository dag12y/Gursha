import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AdminHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Logged in as <span className="font-medium text-foreground">{user?.name || "Admin"}</span>
                        </p>
                        <p>
                            Role: <span className="font-medium text-foreground capitalize">{user?.role || "admin"}</span>
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                            <Button onClick={() => navigate("/admin/restaurants")}>Manage Restaurants</Button>
                            <Button variant="outline" onClick={() => navigate("/admin/assign-staff")}>Assign Staff</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
