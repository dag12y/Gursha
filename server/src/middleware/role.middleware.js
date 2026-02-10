import User from "../models/User.js";

export async function isAdmin(req, res, next) {
    try {
        //get user from database using userId from req.user
        const user = await User.findById(req.user.userId); 

        //check if user exists and has admin role
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Admin only" });
        }
        next();
        
    } catch (error) {
        console.error("Error checking admin role:", error);
        res.status(500).json({ message: "Server error",error: error.message });
    }
};

export async function isStaff(req, res, next) {
    try {
        //get user from database using userId from req.user
        const user = await User.findById(req.user.userId); 
        
        //check if user exists and has staff role
        if (!user || user.role !== "staff") {
            return res.status(403).json({ message: "Access denied: Staff only" });
        }
        next();
        
    } catch (error) {
        console.error("Error checking staff role:", error);
        res.status(500).json({ message: "Server error",error: error.message });
    }
};
