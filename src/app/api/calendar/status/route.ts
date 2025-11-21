import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/firebase/server-init';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    const db = getDb();
    const userTokensRef = doc(db, 'users', userId, 'private', 'googleTokens');
    const tokenDoc = await getDoc(userTokensRef);

    if (!tokenDoc.exists()) {
      return NextResponse.json({ connected: false });
    }

    const tokenData = tokenDoc.data();
    const isExpired = tokenData.expiryDate && tokenData.expiryDate < Date.now();

    return NextResponse.json({
      connected: true,
      hasRefreshToken: !!tokenData.refreshToken,
      isExpired,
      connectedAt: tokenData.updatedAt || null,
    });
  } catch (error: any) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json({
      error: 'Failed to check calendar status',
      details: error.message
    }, { status: 500 });
  }
}
