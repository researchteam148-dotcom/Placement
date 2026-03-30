'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ShieldCheck, Trash2, UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'admin@placementhub.com';
const ADMIN_PASSWORD = 'Admin@123456';

export default function SetupPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [done, setDone] = useState(false);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const clearFirestoreCollection = async (collectionName: string) => {
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            if (snapshot.empty) {
                addLog(`  ✓ Collection '${collectionName}' is already empty.`);
                return 0;
            }
            let count = 0;
            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, collectionName, docSnap.id));
                count++;
            }
            addLog(`  ✓ Deleted ${count} documents from '${collectionName}'.`);
            return count;
        } catch (err: any) {
            addLog(`  ✗ Error clearing '${collectionName}': ${err.message}`);
            return 0;
        }
    };

    const runSetup = async () => {
        setIsRunning(true);
        setLogs([]);
        setDone(false);

        try {
            // Step 1: Sign out any current user
            addLog('🔓 Signing out current user...');
            await signOut(auth);
            addLog('  ✓ Signed out.');

            // Step 2: Clear Firestore collections
            addLog('🗑️ Clearing Firestore data...');
            await clearFirestoreCollection('users');
            await clearFirestoreCollection('jobs');
            addLog('  ✓ Firestore data cleared.');

            // Step 3: Create admin Firebase Auth account
            addLog(`👤 Creating admin account: ${ADMIN_EMAIL}...`);
            const result = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            const uid = result.user.uid;
            addLog(`  ✓ Firebase Auth account created. UID: ${uid}`);

            // Step 4: Create Firestore user document with admin role
            addLog('📝 Writing admin document to Firestore...');
            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                email: ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin',
                createdAt: serverTimestamp(),
                profileCompleted: true,
                status: 'Approved',
            });
            addLog('  ✓ Admin document created with role: admin');

            // Step 5: Sign out (so user can log in fresh)
            addLog('🔓 Signing out seed account...');
            await signOut(auth);
            addLog('  ✓ Done. You can now log in.');

            addLog('');
            addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            addLog('✅ SETUP COMPLETE');
            addLog(`   Email:    ${ADMIN_EMAIL}`);
            addLog(`   Password: ${ADMIN_PASSWORD}`);
            addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            setDone(true);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                addLog('⚠️ Admin account already exists in Firebase Auth.');
                addLog('   Signing in to get UID and fix the Firestore document...');
                
                try {
                    const { signInWithEmailAndPassword } = await import('firebase/auth');
                    const result = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                    const uid = result.user.uid;

                    addLog(`  ✓ Signed in. UID: ${uid}`);
                    addLog('📝 Updating Firestore document to admin role...');
                    
                    await setDoc(doc(db, 'users', uid), {
                        uid: uid,
                        email: ADMIN_EMAIL,
                        name: 'Admin',
                        role: 'admin',
                        createdAt: serverTimestamp(),
                        profileCompleted: true,
                        status: 'Approved',
                    });
                    addLog('  ✓ Admin document updated with role: admin');

                    await signOut(auth);
                    addLog('  ✓ Signed out. You can now log in.');
                    addLog('');
                    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    addLog('✅ SETUP COMPLETE (existing account fixed)');
                    addLog(`   Email:    ${ADMIN_EMAIL}`);
                    addLog(`   Password: ${ADMIN_PASSWORD}`);
                    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    setDone(true);
                } catch (innerErr: any) {
                    addLog(`  ✗ Could not fix existing account: ${innerErr.message}`);
                }
            } else {
                addLog(`✗ ERROR: ${err.message}`);
            }
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-2xl mb-4">
                        <ShieldCheck size={32} className="text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Admin Setup</h1>
                    <p className="text-slate-400 mt-2">Clear all data & create a fresh admin account</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2 text-amber-400">
                            <AlertCircle size={16} />
                            <span className="font-bold">This will:</span>
                        </div>
                        <ul className="ml-6 space-y-1 text-slate-400">
                            <li className="flex items-center gap-2">
                                <Trash2 size={14} />
                                Delete all documents from <code className="bg-slate-800 px-1 rounded">users</code>, <code className="bg-slate-800 px-1 rounded">students</code>, <code className="bg-slate-800 px-1 rounded">jobs</code>
                            </li>
                            <li className="flex items-center gap-2">
                                <UserPlus size={14} />
                                Create admin account: <code className="bg-slate-800 px-1 rounded">{ADMIN_EMAIL}</code>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={runSetup}
                        disabled={isRunning}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {isRunning ? (
                            <><Loader2 size={20} className="animate-spin" /> Running Setup...</>
                        ) : done ? (
                            <><CheckCircle2 size={20} /> Setup Complete — Run Again?</>
                        ) : (
                            <><ShieldCheck size={20} /> Run Setup</>
                        )}
                    </button>
                </div>

                {logs.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Console Output</h2>
                        <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                            {logs.join('\n')}
                        </pre>
                    </div>
                )}

                {done && (
                    <div className="bg-emerald-950 border border-emerald-800 rounded-2xl p-6 text-center">
                        <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
                        <p className="font-bold text-emerald-300 mb-2">Admin account ready!</p>
                        <div className="text-sm text-emerald-400 space-y-1">
                            <p>Email: <code className="bg-emerald-900 px-2 py-0.5 rounded">{ADMIN_EMAIL}</code></p>
                            <p>Password: <code className="bg-emerald-900 px-2 py-0.5 rounded">{ADMIN_PASSWORD}</code></p>
                        </div>
                        <a
                            href="/auth/login"
                            className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                        >
                            Go to Login →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
