import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    ShieldCheck,
    ChefHat,
    Store,
    CalendarCheck,
    UserCircle2,
    LogOut,
} from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, refreshUser, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || user) {
            return;
        }

        refreshUser().catch(() => {});
    }, [isAuthenticated, user, refreshUser]);

    async function handleNavClick(item) {
        if (item === "Logout") {
            await logout();
            navigate("/login");
            return;
        }

        if (item === "Admin") {
            navigate("/admin");
            return;
        }

        if (item === "Staff") {
            navigate("/staff");
            return;
        }

        if (item === "Restaurant") {
            navigate("/restaurants");
            return;
        }

        if (item === "Reservation") {
            navigate("/my-reservations");
            return;
        }

        if (item === "Profile") {
            navigate("/profile");
            return;
        }

        toast.info("Page will be connected soon.");
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    to={isAuthenticated ? "/restaurants" : "/login"}
                    className="text-2xl font-bold text-primary"
                >
                    Gursha
                </Link>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            {[
                                ...(user?.role === "admin"
                                    ? [{ key: "Admin", icon: ShieldCheck }]
                                    : []),
                                ...(user?.role === "staff"
                                    ? [{ key: "Staff", icon: ChefHat }]
                                    : []),
                                { key: "Restaurant", icon: Store },
                                { key: "Reservation", icon: CalendarCheck },
                                { key: "Profile", icon: UserCircle2 },
                                { key: "Logout", icon: LogOut },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={item.key}
                                        variant="ghost"
                                        size="icon"
                                        title={item.key}
                                        aria-label={item.key}
                                        onClick={() => void handleNavClick(item.key)}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Button>
                                );
                            })}
                            <span className="hidden sm:inline text-sm text-muted-foreground">
                                {user?.name || "User"}
                            </span>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
