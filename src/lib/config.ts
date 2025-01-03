import { AuthConfig } from '../types/restreamer';

if (!process.env.NEXT_PUBLIC_RESTREAMER_API_URL) {
  throw new Error('NEXT_PUBLIC_RESTREAMER_API_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_RESTREAMER_PORT) {
  throw new Error('NEXT_PUBLIC_RESTREAMER_PORT is not defined');
}

export const authConfig: AuthConfig = {
  apiUrl: process.env.NEXT_PUBLIC_RESTREAMER_API_URL,
  baseUrl: process.env.NEXT_PUBLIC_RESTREAMER_API_URL.replace(/^https?:\/\//, ''),
  port: process.env.NEXT_PUBLIC_RESTREAMER_PORT,
  username: process.env.NEXT_PUBLIC_RESTREAMER_USERNAME || 'admin',
  password: process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD || '',
}; 