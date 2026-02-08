import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, isAdminInitialized } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    // Check if Firebase Admin is initialized
    if (!isAdminInitialized || !adminAuth || !adminDb) {
        return NextResponse.json(
            {
                error: 'Firebase Admin SDK not configured. Please add service account credentials to .env.local',
                details: 'Missing FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY'
            },
            { status: 500 }
        );
    }

    try {
        const { name, email, industry, adminUid } = await request.json();

        // Validate input
        if (!name || !email || !industry || !adminUid) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify admin authentication
        const adminUserDoc = await adminDb.collection('users').doc(adminUid).get();
        const adminUser = adminUserDoc.data();

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            );
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'; // Ensure it meets Firebase requirements

        // Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName: name,
            emailVerified: false,
        });

        // Create Firestore user document
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name,
            role: 'recruiter',
            industry,
            createdAt: new Date().toISOString(),
            status: 'Approved',
            profileCompleted: false,
        });

        // Also add to students collection for consistency (if needed)
        // Note: You might want to create a separate 'recruiters' collection instead

        return NextResponse.json({
            success: true,
            message: 'Recruiter created successfully',
            tempPassword,
            email,
        });

    } catch (error: any) {
        console.error('Error creating recruiter:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json(
                { error: 'Email already exists in the system' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create recruiter' },
            { status: 500 }
        );
    }
}
