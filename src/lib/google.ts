import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
  : 'http://localhost:3000/api/auth/google/callback';

export function getOAuth2Client() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Google client ID or secret is not set in environment variables.'
    );
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}
