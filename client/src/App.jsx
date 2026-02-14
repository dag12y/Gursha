import AppRouter from "./routes/AppRouter";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
            <Toaster position="top-right" />
        </>
    );
}

export default App;
