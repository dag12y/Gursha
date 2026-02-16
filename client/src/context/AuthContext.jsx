/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getCurrentUser as getCurrentUserRequest,
    login as loginRequest,
    register as registerRequest,
} from "@/api/auth";
import { getToken, removeToken, setToken } from "@/utils/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function getStoredUser() {
    const raw = localStorage.getItem("user");
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => getToken());
    const [user, setUserState] = useState(() =>
        getToken() ? getStoredUser() : null,
    );

    const setUser = useCallback((nextUser) => {
        setUserState(nextUser);
        if (nextUser) {
            localStorage.setItem("user", JSON.stringify(nextUser));
            return;
        }
        localStorage.removeItem("user");
    }, []);

    const refreshUser = useCallback(async () => {
        if (!getToken()) {
            setUser(null);
            return null;
        }

        const response = await getCurrentUserRequest();
        const currentUser = response?.user ?? response?.data?.user ?? response?.data ?? null;
        setUser(currentUser);
        return currentUser;
    }, [setUser]);

    const login = useCallback(async (email, password) => {
        const response = await loginRequest(email, password);
        const nextToken = response?.token ?? response?.data?.token ?? null;

        if (!nextToken) {
            throw new Error("No token returned from login.");
        }

        setToken(nextToken);
        setTokenState(nextToken);
        await refreshUser();
        toast.success("Logged in successfully!");
        return response;
    }, [refreshUser]);

    const register = useCallback(async (name, email, password) => {
        const response = await registerRequest(name, email, password);
        toast.success("Registered successfully!");
        return response;
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setTokenState(null);
        setUser(null);
        toast.success("Logged out.");
    }, [setUser]);

    const value = useMemo(
        () => ({
            token,
            user,
            login,
            register,
            logout,
            isAuthenticated: Boolean(token),
            refreshUser,
            setUser,
        }),
        [token, user, login, register, logout, refreshUser, setUser],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
