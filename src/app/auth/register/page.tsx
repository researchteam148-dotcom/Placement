'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    GraduationCap,
    Building2,
    ArrowRight,
    Mail,
    User,
    Lock,
    CheckCircle2,
    ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterContent = () => {
    const searchParams = useSearchParams();
    const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

    const [role, setRole] = useState(initialRole);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '' // For recruiters
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUpWithEmail, signInWithGoogle, user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && user) {
            router.push(`/dashboard/${user.role}`);
        }
    }, [user, loading, router]);

    const handleStepNext = () => setStep(step + 1);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signUpWithEmail(
                formData.email,
                formData.password,
                formData.name,
                role as any,
                formData.companyName // Pass company name for recruiters
            );
            // Success - redirect will happen via useEffect
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full grid lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">

                {/* Left Side: Visual/Context */}
                <div className="hidden lg:flex bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 flex-col justify-between text-white">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-12">
                            <GraduationCap size={32} />
                            <span className="text-xl font-bold">PlacementHub</span>
                        </Link>
                        <h2 className="text-4xl font-extrabold leading-tight mb-6">
                            Join the largest <br />
                            career network <br />
                            for students.
                        </h2>
                        <ul className="space-y-4">
                            {[
                                'Verified opportunities from top firms',
                                'AI-driven resume shortlisting',
                                'Real-time interview alerts',
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-2 text-indigo-100">
                                    <CheckCircle2 size={18} className="text-indigo-300" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="text-sm text-indigo-200">
                        Trusted by 500+ Universities across the globe.
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 lg:p-12">
                    {step === 1 ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                            <p className="text-slate-500 mb-8">Choose your role to get started.</p>

                            <div className="grid gap-4 mb-8">
                                <button
                                    onClick={() => setRole('student')}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${role === 'student' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <GraduationCap size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">I'm a Student</div>
                                        <div className="text-xs text-slate-500">I want to apply for jobs and internships.</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setRole('recruiter')}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${role === 'recruiter' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${role === 'recruiter' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">I'm a Recruiter</div>
                                        <div className="text-xs text-slate-500">I want to hire top talent for my company.</div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={handleStepNext}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                Continue to Register <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <button
                                onClick={() => setStep(1)}
                                type="button"
                                className="text-sm font-bold text-slate-400 hover:text-indigo-600 mb-6 flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Choose different role
                            </button>

                            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Create Account</h2>
                            <p className="text-slate-500 mb-8">Sign up as a <span className="text-indigo-600 font-bold capitalize">{role}</span></p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {role === 'recruiter' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                placeholder="Acme Corporation"
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@university.edu"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 mt-8 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Sign Up"
                                    )}
                                </button>
                                <p className="text-center mt-8 text-slate-500 font-medium">
                                    Already have an account? <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                                </p>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RegisterPage = () => {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <RegisterContent />
        </React.Suspense>
    );
};

export default RegisterPage;
