import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function StaffRoute({ children }) {
    const { isAuthenticated, user, refreshUser } = useAuth();
    const location = useLocation();
    const [checkingUser, setCheckingUser] = useState(
        Boolean(isAuthenticated && !user),
    );

    useEffect(() => {
        let isMounted = true;

        async function ensureUserLoaded() {
            if (!isAuthenticated || user) {
                if (isMounted) {
                    setCheckingUser(false);
                }
                return;
            }

            try {
                await refreshUser();
            } catch {
                // ProtectedRoute/AuthContext handles invalid token flow.
            } finally {
                if (isMounted) {
                    setCheckingUser(false);
                }
            }
        }

        ensureUserLoaded();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user, refreshUser]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (checkingUser) {
        return (
            <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
                Loading staff access...
            </div>
        );
    }

    const role = user?.role;
    const canAccessStaff = role === "staff";

    if (!canAccessStaff) {
        return (
            <Navigate
                to="/unauthorized"
                replace
                state={{
                    from: location.pathname,
                    requiredRole: "staff",
                }}
            />
        );
    }

    return children;
}
