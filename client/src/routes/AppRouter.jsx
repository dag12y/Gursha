import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Restaurant from "../pages/diner/Restaurants";
import ReserveRestaurantPage from "../pages/diner/ReserveRestaurant";
import MyReservationsPage from "../pages/diner/MyReservations";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/restaurants"
                element={
                    <ProtectedRoute>
                        <Restaurant />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/restaurants/:id/reserve"
                element={
                    <ProtectedRoute>
                        <ReserveRestaurantPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-reservations"
                element={
                    <ProtectedRoute>
                        <MyReservationsPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default AppRouter;
