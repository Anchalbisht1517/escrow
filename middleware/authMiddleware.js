import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'dotenv/config';

// 1. Authentication Middleware
export const protect = async (req, res, next) => {
    try {
        let token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token found"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Fetch user from DB and attach to req object (excluding password)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed or expired"
        });
    }
};

// 2. Strict Role-Based Access Control (RBAC) Middleware
// Note: Since your schema uses 'client' (which acts as the company role) and 'freelancer',
// we pass the acceptable roles as parameters (e.g., restrictTo('client'), restrictTo('freelancer'))
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access denied. Role '${req.user?.role}' is not authorized.`
            });
        }
        next();
    };
};

// 3. Admin-only Middleware
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Access denied. Admins only."
        });
    }
};
