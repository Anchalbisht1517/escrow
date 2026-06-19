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



export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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
            message: error.message
        });
    }
};

export const deleteAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
            message: "Avatar deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No resume uploaded"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
            message: error.message
        });
    }
};
export const deleteResume = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
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
            message: "Resume deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is missing"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const user = await User.findById(decoded.id);
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

        generateTokens(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully"
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

export const getMe = async (req, res) => {
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

export const getUserPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance transactionHistory');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            walletBalance: user.walletBalance,
            transactionHistory: user.transactionHistory || []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};