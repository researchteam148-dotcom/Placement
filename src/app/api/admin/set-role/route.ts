import { NextRequest, NextResponse } from 'next/server';
import { adminDb, isAdminInitialized } from '@/lib/firebase-admin';

// Temporary endpoint to fix admin role in Firestore
// Usage: POST /api/admin/set-role with { uid, role }
export async function POST(request: NextRequest) {
    if (!isAdminInitialized || !adminDb) {
        return NextResponse.json(
            { error: 'Firebase Admin SDK not configured' },
            { status: 500 }
        );
    }

    try {
        const { uid, role } = await request.json();

        if (!uid || !role) {
            return NextResponse.json(
                { error: 'Missing uid or role' },
                { status: 400 }
            );
        }

        if (!['admin', 'student', 'recruiter'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be admin, student, or recruiter' },
                { status: 400 }
            );
        }

        // Update the user's role in Firestore
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            await userRef.update({ role });
            return NextResponse.json({
                success: true,
                message: `Role updated to '${role}' for UID: ${uid}`,
                previousRole: userDoc.data()?.role,
            });
        } else {
            return NextResponse.json(
                { error: `No user document found for UID: ${uid}` },
                { status: 404 }
            );
        }
    } catch (error: unknown) {
        console.error('Error setting role:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
