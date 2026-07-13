import { Method } from 'axios';

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// Google OAuth Constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/login/callback`;
export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const VITE_BODY_ENCRYPTION_KEY = process.env.VITE_BODY_ENCRYPTION_KEY;
export const VITE_BODY_ENCRYPTION_SALT = process.env.VITE_BODY_ENCRYPTION_SALT;

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
}

export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
    path: '/api/login/refresh',
    maxAge: REFRESH_COOKIE_MAX_AGE,
}

export const DEFAULT_REQ_METHOD: Method = 'GET';
export const TOKEN_KEY = 'BK_AUTH';

