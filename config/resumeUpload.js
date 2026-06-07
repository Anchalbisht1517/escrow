import { cloudinary } from "./avatarUpload.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

export const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "freelance-platform/resumes",
    resource_type: "raw",
  },
});

export const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

export const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

