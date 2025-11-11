import "server-only";
import { initializeApp, getApps, App, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (serviceAccount) {
    // For production with explicit service account
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else if (process.env.FIREBASE_DEPLOY_AGENT) {
    // For Firebase App Hosting - use Application Default Credentials
    // Clear invalid GOOGLE_APPLICATION_CREDENTIALS if it exists
    const originalGoogleCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (originalGoogleCreds === '/dev/null' || originalGoogleCreds === '') {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    return initializeApp({
      credential: applicationDefault(),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // For local development with Firebase CLI authentication
    // This will use the emulator or require Firebase login
    return initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export function getDb(): Firestore {
  return getFirestore(getAdminApp());
}
