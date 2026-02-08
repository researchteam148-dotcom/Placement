'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User as FirebaseUser,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: (role?: UserRole) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// REFACTORED: Extracted duplicate user creation logic
const createUserDocument = async (
    firebaseUser: FirebaseUser,
    role: UserRole,
    displayName?: string,
    companyName?: string
): Promise<User> => {
    const newUser: Omit<User, 'createdAt'> & { createdAt: FieldValue } = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: displayName || firebaseUser.displayName || 'Anonymous User',
        role: role,
        createdAt: serverTimestamp(),
        profileCompleted: false,
        // Set status based on role - recruiters need approval
        status: role === 'recruiter' ? 'Pending' : 'Approved',
        // Add company name for recruiters
        ...(role === 'recruiter' && companyName && { companyName }),
    };

    await setDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid), newUser);

    // Return user with timestamp as any for immediate use
    return { ...newUser, createdAt: new Date() } as User;
};

// IMPROVED: User-friendly error messages
const getErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';

    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed.';
        default:
            return error?.message || 'An unexpected error occurred.';
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Fetch user data from Firestore
                    const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        // Set user data - status checks happen in signInWithEmail only
                        setUser(userData);
                    } else {
                        // FIXED: New user logic with extracted function
                        const newUser = await createUserDocument(firebaseUser, 'student');
                        setUser(newUser);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Auth state change error:', err);
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);

            // After successful auth, check user status for recruiters
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;

                    // Block pending/rejected recruiters from logging in
                    if (userData.role === 'recruiter' && userData.status) {
                        if (userData.status === 'Pending') {
                            await signOut(auth);
                            throw new Error('Your account is pending admin approval. Please wait for approval to access the dashboard.');
                        } else if (userData.status === 'Rejected') {
                            await signOut(auth);
                            throw new Error('Your account has been rejected by admin. Please contact support for more information.');
                        }
                    }
                }
            }
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const signInWithGoogle = async (role: UserRole = 'student') => {
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            const userDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid));
            if (!userDoc.exists()) {
                const newUser = await createUserDocument(firebaseUser, role);
                setUser(newUser);
            }
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const signUpWithEmail = async (
        email: string,
        password: string,
        name: string,
        role: UserRole,
        companyName?: string
    ) => {
        setError(null);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = result.user;

            const newUser = await createUserDocument(firebaseUser, role, name, companyName);
            setUser(newUser);
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
            setUser(null);
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
