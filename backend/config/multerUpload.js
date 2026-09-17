import multer from 'multer';

// Use memoryStorage instead of diskStorage.
// Files are held in req.file.buffer (RAM) temporarily,
// then we stream them to Cloudinary in the controller.
// Nothing is ever written to the local filesystem.
const memoryStorage = multer.memoryStorage();

// File filter — only allow image formats for avatars
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP files are allowed'));
  }
};

// File filter — only allow PDF for resumes
const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Avatar upload middleware — 2MB max, images only, stored in memory
export const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Resume upload middleware — 5MB max, PDFs only, stored in memory
export const uploadResumeLocal = multer({
  storage: memoryStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
