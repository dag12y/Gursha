import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function formatDate(value) {
    if (!value) {
        return "N/A";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "N/A";
    }

    return parsed.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const displayName = useMemo(() => user?.name || "Unknown User", [user]);
    const displayEmail = useMemo(() => user?.email || "No email", [user]);
    const displayRole = useMemo(() => user?.role || "diner", [user]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{displayName}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{displayEmail}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Role:</span>
                            <span className="font-medium capitalize">{displayRole}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Joined:</span>
                            <span className="font-medium">{formatDate(user?.createdAt)}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/restaurants")}>
                        Back to Restaurants
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
