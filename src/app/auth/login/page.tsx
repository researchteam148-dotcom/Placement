'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    React.useEffect(() => {
        if (!loading && user) {
            router.push(`/dashboard/${user.role}`);
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithEmail(formData.email, formData.password);
            // Success - redirect will happen via useEffect
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
            setIsSubmitting(false);
        }
    };

    if (loading || user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-20 text-white">
                        <GraduationCap className="w-10 h-10" />
                        <span className="text-2xl font-bold tracking-tight">PlacementHub</span>
                    </Link>
                    <h2 className="text-5xl font-bold leading-tight mb-8">
                        Your Journey to a <br />
                        Successful Career <br />
                        Starts Here.
                    </h2>
                    <p className="text-indigo-100 text-xl max-w-sm">
                        Access hundreds of job opportunities, track your applications, and build your professional profile.
                    </p>
                </div>
                <div className="relative z-10 flex gap-12 text-sm font-medium text-indigo-200">
                    <span>&copy; 2026 PlacementHub</span>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                </div>

                {/* Background blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex items-center justify-center p-8 bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 lg:hidden">
                        <Link href="/" className="flex items-center gap-2 text-indigo-600">
                            <GraduationCap className="w-8 h-8" />
                            <span className="text-xl font-bold">PlacementHub</span>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 mb-8">Please login to access your account.</p>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm"
                        >
                            <Chrome className="text-indigo-600" size={20} />
                            Continue with Google
                        </button>

                        <div className="relative my-8 text-center text-sm">
                            <span className="bg-slate-50 px-4 text-slate-400 relative z-10">or continue with email</span>
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200"></div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="name@university.edu"
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 mt-8 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Log In <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 mt-8 text-sm">
                        Don't have an account? {' '}
                        <Link href="/auth/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                            Sign up free
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
