import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from "../emailVerify/verifyEmail.js";
import { generateTokens } from "../utils/generateTokens.js";

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory"
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "user already exists"
            })

        }

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            role
        })
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1h' })
        await sendVerificationEmail({ token, email });
        return res.status(200).json({
            success: true,
            message: "user registred successfully"
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is not verified"
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        generateTokens(res, user._id);

        return res.status(200).json({
            success: true,
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// Logout Controller — Stateless Session Destruction by clearing cookies
export const logout = async (req, res) => {
    try {
        // Clear accessToken cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Clear refreshToken cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Simple Profile controller to test authentication & roles
export const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
