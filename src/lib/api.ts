const rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// Clean trailing /api or / to prevent duplicate /api/api paths
export const API_URL = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
