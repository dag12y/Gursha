import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Gursha";

connectDB(MONGO_URI);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
