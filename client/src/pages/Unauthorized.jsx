import { useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const requiredRole = location.state?.requiredRole;
    const from = location.state?.from;

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldAlert className="h-6 w-6" />
                        Unauthorized
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>You do not have permission to access this page.</p>
                    {requiredRole ? (
                        <p>
                            Required role: <span className="font-medium text-foreground capitalize">{requiredRole}</span>
                        </p>
                    ) : null}
                    {from ? (
                        <p>
                            Requested path: <span className="font-medium text-foreground">{from}</span>
                        </p>
                    ) : null}

                    <div className="flex gap-2 pt-2">
                        <Button onClick={() => navigate("/restaurants")}>Go to Restaurants</Button>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
