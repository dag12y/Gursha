import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Navbar() {
    const { user, isAuthenticated } = useAuth();
    const navItems = ["Restaurant", "Reservation", "Profile"];

    function handlePlaceholderClick(label) {
        toast.info(`${label} page will be connected soon.`);
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
                            {navItems.map((item) => (
                                <Button
                                    key={item}
                                    variant="ghost"
                                    onClick={() => handlePlaceholderClick(item)}
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
