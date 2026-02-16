import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, refreshUser } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || user) {
            return;
        }

        refreshUser().catch(() => {});
    }, [isAuthenticated, user, refreshUser]);

    function handleNavClick(item) {
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
                            {["Restaurant", "Reservation", "Profile"].map((item) => (
                                <Button
                                    key={item}
                                    variant="ghost"
                                    onClick={() => handleNavClick(item)}
                                >
                                    {item}
                                </Button>
                            ))}
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
