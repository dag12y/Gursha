export function registerUser(req, res) {
    // Registration logic here
    res.status(201).json({ message: "User registered successfully" });
}

export function loginUser(req, res) {
    // Login logic here
    res.status(200).json({ message: "User logged in successfully" });
}

export function getCurrentUser(req, res) {
    // Logic to get current user info here
    res.status(200).json({ message: "Current user info" });
}