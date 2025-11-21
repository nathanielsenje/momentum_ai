import { getOAuth2Client } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET() {
  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent',
  });

  return NextResponse.json({ authUrl });
}
