'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Briefcase,
    CheckCircle2,
    Clock,
    TrendingUp,
    FileText,
    ExternalLink,
    GraduationCap,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        const fetchRecentJobs = async () => {
            try {
                const q = query(collection(db, 'jobs'), limit(3));
                const snapshot = await getDocs(q);
                setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchRecentJobs();
    }, []);

    const stats = [
        { label: 'Applied Jobs', value: '12', icon: <Briefcase className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Shortlisted', value: '3', icon: <CheckCircle2 className="text-emerald-600" />, color: 'bg-emerald-50' },
        { label: 'Pending', value: '8', icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
        { label: 'Profile Score', value: '85%', icon: <TrendingUp className="text-indigo-600" />, color: 'bg-indigo-50' },
    ];

    return (
        <div className="space-y-12 pb-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name}! 👋</h1>
                <p className="text-lg text-slate-500 mt-2 font-medium">Here's a glimpse into your placement journey today.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 rounded-[32px] group hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <Sparkles size={20} />
                            </div>
                            Smart Matches
                        </h2>
                        <Link href="/jobs" className="text-indigo-600 font-black text-sm hover:underline flex items-center gap-2 group">
                            Explore All <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {loadingJobs ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-3xl border border-slate-100">
                                No recent jobs found. Check back soon!
                            </div>
                        ) : (
                            jobs.map((job: any) => (
                                <motion.div
                                    key={job.id}
                                    whileHover={{ x: 10 }}
                                    className="bg-white border-2 border-slate-50 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-center w-full md:w-auto text-center md:text-left">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 font-black text-indigo-600 text-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500 shadow-sm overflow-hidden p-2">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                            ) : (
                                                job.company?.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                                                <h3 className="font-black text-slate-900 text-xl tracking-tight">{job.title}</h3>
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest shadow-sm">
                                                    {job.type || 'Full-time'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-slate-500 font-bold mb-3">
                                                <span>{job.company}</span>
                                                <span className="hidden md:inline text-slate-300">•</span>
                                                <div className="flex items-center gap-1 text-slate-900">
                                                    <span className="text-indigo-600">₹</span> {job.salary || 'Not Disclosed'}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                                {job.perks && job.perks.slice(0, 2).map((p: string, i: number) => (
                                                    <span key={i} className="text-[10px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/jobs/${job.id}`} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95 text-center">
                                        View Details
                                    </Link>
                                </motion.div>
                            )))}
                    </div>
                </div>

                <div className="space-y-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Quick Actions</h2>
                        <div className="glass-card p-8 rounded-[32px] space-y-6">
                            <Link
                                href="/dashboard/student/resume-builder"
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all group"
                            >
                                <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Sparkles size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-sm">AI Resume Builder</div>
                                    <div className="text-xs opacity-70 font-bold">Craft with AI assistance</div>
                                </div>
                            </Link>

                            <Link
                                href="/resume"
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-indigo-600 hover:text-white transition-all group"
                            >
                                <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-sm">Resume Hub</div>
                                    <div className="text-xs text-slate-500 group-hover:text-indigo-100 font-bold">Manage & Optimize</div>
                                </div>
                            </Link>

                            <Link
                                href="/jobs"
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 hover:bg-emerald-600 hover:text-white transition-all group"
                            >
                                <div className="bg-white p-2 rounded-xl text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-black text-sm">Eligibility Check</div>
                                    <div className="text-xs text-slate-500 group-hover:text-emerald-100 font-bold">See smart matches</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-[32px] p-8 text-white overflow-hidden relative shadow-2xl shadow-indigo-200 group">
                        <div className="relative z-10">
                            <div className="bg-white/20 backdrop-blur-md w-fit p-3 rounded-2xl mb-6 border border-white/20">
                                <GraduationCap size={32} />
                            </div>
                            <h3 className="font-black text-2xl mb-3 leading-tight">Job Fair <br />2026 Edition</h3>
                            <p className="text-sm text-indigo-100 mb-8 leading-relaxed font-bold">Join the biggest hiring event with 200+ top-tier tech companies on Feb 15th.</p>
                            <button className="bg-white text-indigo-700 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                                Register Interest
                            </button>
                        </div>
                        <GraduationCap className="absolute -bottom-8 -right-8 text-white/10 w-48 h-48 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
