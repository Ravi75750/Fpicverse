/**
 * Centralized configuration for the PicVerse frontend.
 */

const getApiUrl = () => {
    // VITE_API_URL should be the base URL of your backend (e.g., https://your-api.vercel.app)
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove trailing slash if present
    return url.replace(/\/$/, "");
};

export const API_BASE_URL = getApiUrl();
