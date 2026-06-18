import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const avatarDir = 'uploads/avatars';
const resumeDir = 'uploads/resumes';

[avatarDir, resumeDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage for resumes
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, resumeDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filters
const avatarFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and WEBP files are allowed'));
    }
};

const resumeFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

// Upload instances
export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export const uploadResumeLocal = multer({
    storage: resumeStorage,
    fileFilter: resumeFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});