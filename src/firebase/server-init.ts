import "server-only";
import { initializeApp, getApps, App, cert } from "firebase-admin/app";
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
    // For production-like environments, use the service account
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // For local development, it can often connect without credentials
    // if the user is authenticated via the Firebase CLI.
    return initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

export function getDb(): Firestore {
  return getFirestore(getAdminApp());
}
