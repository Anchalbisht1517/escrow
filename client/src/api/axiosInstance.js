// Import the axios library for making HTTP requests
import axios from 'axios';

// Create a pre-configured axios instance with shared settings
// so we don't repeat baseURL and withCredentials on every single call
const API = axios.create({
  // Read the backend URL from the .env file (VITE_API_BASE_URL)
  // In dev: http://localhost:5000 | In prod: your Render URL
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // Send cookies (JWT access/refresh tokens) with every request
  // Required for our httpOnly cookie-based auth to work
  withCredentials: true,
});

// Export the instance so any file can import and use it
export default API;