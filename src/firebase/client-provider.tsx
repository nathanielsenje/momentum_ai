'use client';

import React, { ReactNode } from 'react';
import { initializeFirebase } from './config';
import { FirebaseProvider } from './provider';

// This provider is for the client-side, ensuring Firebase is initialized once.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseContext = initializeFirebase();
  return <FirebaseProvider value={firebaseContext}>{children}</FirebaseProvider>;
}
