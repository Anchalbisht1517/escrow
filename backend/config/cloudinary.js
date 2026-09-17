// Import the Cloudinary v2 SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from .env
// These values come from your Cloudinary dashboard
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g. hjcjpgt2
  api_key: process.env.CLOUDINARY_API_KEY,       // numeric key from dashboard
  api_secret: process.env.CLOUDINARY_API_SECRET, // secret — never expose to frontend
});

// Export the configured instance for use in controllers
export default cloudinary;
