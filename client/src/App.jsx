import AppRouter from "./routes/AppRouter";
import { Toaster } from "sonner";

function App() {
    return (
        <>
            <AppRouter />
            <Toaster position="top-right" />
        </>
    );
}

export default App;
