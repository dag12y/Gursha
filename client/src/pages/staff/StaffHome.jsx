import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function StaffHomePage() {
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
