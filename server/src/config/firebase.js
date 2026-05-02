const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

/**
 * Initialize Firebase Admin SDK and Firestore
 * Supports both service account JSON file and individual env vars
 */
function initializeFirebase() {
  if (db) return db;

  try {
    let credential;

    // Option 1: Service account JSON file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      credential = cert(serviceAccount);
    }
    // Option 2: Individual env vars
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Private key comes as a string with escaped newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      console.warn('⚠️  Firebase credentials not configured. Using in-memory mock mode.');
      return null;
    }

    const app = initializeApp({ credential });
    db = getFirestore(app);

    console.log('🔥 Firebase Firestore connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return null;
  }
}

/**
 * Get Firestore database instance
 */
function getDb() {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
}

module.exports = { initializeFirebase, getDb };
