import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { login as loginRequest } from "@/api/auth";
import { getToken, setToken } from "@/utils/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => getToken());
    const [user, setUser] = useState(null);

    async function login(email, password) {
        const response = await loginRequest(email, password);
        const nextToken = response?.token ?? null;

        if (!nextToken) {
            throw new Error("No token returned from login.");
        }

        setToken(nextToken);
        setTokenState(nextToken);
        toast.success("Logged in successfully!");
        return response;
    }

    const value = useMemo(
        () => ({
            token,
            user,
            login,
            isAuthenticated: Boolean(token),
            setUser,
        }),
        [token, user],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
