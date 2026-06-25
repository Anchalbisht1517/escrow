import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { sendVerificationEmail } from "../emailVerify/verifyEmail.js";
import { generateTokens } from "../utils/generateTokens.js";


export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory",
                data: null
            })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "user already exists",
                data: null
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
            message: "user registred successfully",
            data: null
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: null
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
                message: "User not found",
                data: null
            });
        }

        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User is not verified",
                data: null
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                data: null
            });
        }

        generateTokens(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
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
            message: "Logged out successfully",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

// Simple Profile controller to test authentication & roles
export const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: { user: req.user }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};



export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                data: null
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        // Delete old avatar if it exists
        if (user.avatar) {
            const oldPath = user.avatar.replace('/uploads/', 'uploads/');
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new avatar path
        user.avatar = `/uploads/avatars/${req.file.filename}`;
        user.avatarPublicId = req.file.filename; // keep for reference
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: { avatar: user.avatar }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

export const deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        if (user.avatar) {
            const filePath = user.avatar.replace('/uploads/', 'uploads/');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        user.avatar = "";
        user.avatarPublicId = "";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Avatar deleted successfully",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded",
                data: null
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        // Delete old resume if exists
        if (user.freelancerInfo?.resume?.url) {
            const oldPath = user.freelancerInfo.resume.url.replace('/uploads/', 'uploads/');
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        user.freelancerInfo.resume = {
            public_id: req.file.filename,
            url: `/uploads/resumes/${req.file.filename}`
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            data: { resume: user.freelancerInfo.resume }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};
export const deleteResume = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        if (user.freelancerInfo?.resume?.url) {
            const filePath = user.freelancerInfo.resume.url.replace('/uploads/', 'uploads/');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        user.freelancerInfo.resume = {
            public_id: "",
            url: ""
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Resume deleted successfully",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is missing",
                data: null
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
                data: null
            });
        }

        generateTokens(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: null
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
            data: null
        });
    }
};

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Current user data retrieved successfully",
            data: { user: req.user }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

export const getUserPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: "User public profile retrieved successfully",
            data: { user }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

export const getUserWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance transactionHistory');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: "User wallet details retrieved successfully",
            data: {
                walletBalance: user.walletBalance,
                transactionHistory: user.transactionHistory || []
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};

// ─── TOP UP WALLET (Client only — manual/fake top-up for dev, replaced by Razorpay later) ───
export const topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid positive amount is required",
                data: null
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", data: null });
        }

        user.walletBalance += amount;
        user.transactionHistory.push({
            amount,
            type: 'credit',
            description: `Wallet top-up of ₹${amount}`,
            date: new Date()
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: `Wallet topped up successfully. New balance: ₹${user.walletBalance}`,
            data: { walletBalance: user.walletBalance }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};

// ─── WITHDRAW FROM WALLET (Freelancer only — manual for now, Razorpay Payout later) ───
export const withdrawFromWallet = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid positive amount is required",
                data: null
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", data: null });
        }

        if (user.walletBalance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. Available: ₹${user.walletBalance}`,
                data: null
            });
        }

        user.walletBalance -= amount;
        user.transactionHistory.push({
            amount,
            type: 'debit',
            description: `Withdrawal of ₹${amount} to bank account`,
            date: new Date()
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: `Withdrawal of ₹${amount} initiated. New balance: ₹${user.walletBalance}`,
            data: { walletBalance: user.walletBalance }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message, data: null });
    }
};