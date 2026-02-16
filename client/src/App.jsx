import AppRouter from "./routes/AppRouter";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

function App() {
    return (
        <>
            <AuthProvider>
                <Navbar />
                <AppRouter />
            </AuthProvider>
            <Toaster position="top-right" />
        </>
    );
}

export default App;
