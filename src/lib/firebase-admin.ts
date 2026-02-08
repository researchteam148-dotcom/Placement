import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Check if credentials are available
    if (!projectId || !clientEmail || !privateKey) {
        console.warn(
            '⚠️ Firebase Admin SDK credentials not found in environment variables.\n' +
            'Please add the following to your .env.local file:\n' +
            '- FIREBASE_ADMIN_PROJECT_ID\n' +
            '- FIREBASE_ADMIN_CLIENT_EMAIL\n' +
            '- FIREBASE_ADMIN_PRIVATE_KEY\n' +
            'See firebase_admin_setup.md for instructions.'
        );
    } else {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log('✅ Firebase Admin initialized successfully');
        } catch (error) {
            console.error('❌ Firebase Admin initialization error:', error);
        }
    }
}

// Export with safe fallbacks
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const isAdminInitialized = admin.apps.length > 0;
export default admin;
