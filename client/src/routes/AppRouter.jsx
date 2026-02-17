import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Restaurant from "../pages/diner/Restaurants";
import ReserveRestaurantPage from "../pages/diner/ReserveRestaurant";
import MyReservationsPage from "../pages/diner/MyReservations";
import ProfilePage from "../pages/diner/Profile";
import ProtectedRoute from "../components/ProtectedRoute";
import StaffRoute from "../components/StaffRoute";
import AdminRoute from "../components/AdminRoute";
import StaffHomePage from "../pages/staff/StaffHome";
import StaffReservationsPage from "../pages/staff/StaffReservations";
import StaffAnalyticsPage from "../pages/staff/StaffAnalytics";
import StaffTablesPage from "../pages/staff/StaffTables";
import AdminHomePage from "../pages/admin/AdminHome";
import AdminRestaurantsPage from "../pages/admin/AdminRestaurants";
import AdminAssignStaffPage from "../pages/admin/AdminAssignStaff";
import UnauthorizedPage from "../pages/Unauthorized";
import NotFoundPage from "../pages/NotFound";

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
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/staff"
                element={
                    <StaffRoute>
                        <StaffHomePage />
                    </StaffRoute>
                }
            />
            <Route
                path="/staff/reservations"
                element={
                    <StaffRoute>
                        <StaffReservationsPage />
                    </StaffRoute>
                }
            />
            <Route
                path="/staff/analytics"
                element={
                    <StaffRoute>
                        <StaffAnalyticsPage />
                    </StaffRoute>
                }
            />
            <Route
                path="/staff/tables"
                element={
                    <StaffRoute>
                        <StaffTablesPage />
                    </StaffRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminHomePage />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/restaurants"
                element={
                    <AdminRoute>
                        <AdminRestaurantsPage />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/assign-staff"
                element={
                    <AdminRoute>
                        <AdminAssignStaffPage />
                    </AdminRoute>
                }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRouter;
