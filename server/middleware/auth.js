import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.json({ success: false, message: "Not authorized" });
        }

        // Remove "Bearer " prefix
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.json({ success: false, message: "Not authorized" });
        }

        // Load user
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.json({ success: false, message: "User not found" });
        }

        next();
    } catch (error) {
        return res.json({ success: false, message: "Not authorized" });
    }
};
