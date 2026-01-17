'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    CheckCircle2,
    ArrowLeft,
    Share2,
    Bookmark,
    Send,
    FileText,
    Clock,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const JobDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const docRef = doc(db, 'jobs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setJob({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Job not found');
                }
            } catch (err: any) {
                console.error("Error fetching job:", err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            alert("Please login to apply");
            return;
        }
        if (user.role !== 'student') {
            alert("Only students can apply for jobs.");
            return;
        }

        setApplied(true); // Optimistic UI
        try {
            const applicationData = {
                jobId: id,
                title: job.title,
                company: job.company,
                status: 'Pending',
                appliedAt: new Date().toISOString(),
                applicantId: user.uid,
                applicantName: user.name || user.email,
                applicantEmail: user.email,
                logo: job.logo || null
            };

            // 1. Add to user's applications subcollection (for Student view)
            await setDoc(doc(db, 'users', user.uid, 'applications', id), applicationData);

            // 2. Add to job's applications subcollection (for Recruiter/Admin view)
            await setDoc(doc(db, 'jobs', id, 'applications', user.uid), applicationData);

            // 3. Increment applicant count on job document
            const jobRef = doc(db, 'jobs', id);
            await updateDoc(jobRef, {
                applicants: increment(1)
            });

            alert("Application submitted successfully!");
        } catch (error) {
            console.error("Error applying:", error);
            setApplied(false); // Revert on error
            alert("Failed to apply. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-[72px] flex items-center justify-center">
                <Navbar />
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-slate-50 pt-[72px]">
                <Navbar />
                <div className="max-w-5xl mx-auto px-6 py-12 text-center">
                    <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm inline-block">
                        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h2>
                        <p className="text-slate-500 mb-8">{error || "This job listing may have been removed or doesn't exist."}</p>
                        <Link href="/jobs" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Browse All Jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <Link href="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to all jobs
                </Link>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center font-black text-4xl text-indigo-600 shadow-sm overflow-hidden p-2">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-4xl">{job.company?.charAt(0) || <Building2 />}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{job.title}</h1>
                                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 whitespace-nowrap">
                                        {job.type || 'Full-time'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-6 text-slate-500 font-bold">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="text-indigo-600" size={20} /> {job.company}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-indigo-600" size={18} /> {job.location || 'Remote'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">About the Role</h2>
                            <div className="text-slate-600 leading-relaxed mb-8 text-lg whitespace-pre-wrap">
                                {job.description}
                            </div>

                            <div className="space-y-8">
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="text-indigo-600" size={24} /> Responsibilities
                                        </h3>
                                        <ul className="grid gap-3">
                                            {job.responsibilities.map((r: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0"></span>
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {job.requirements && job.requirements.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <FileText className="text-indigo-600" size={24} /> Requirements
                                        </h3>
                                        <ul className="grid gap-3">
                                            {job.requirements.map((r: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0"></span>
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <aside className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm sticky top-32">
                            <div className="space-y-6 mb-8 text-center sm:text-left">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Salary Range</div>
                                    <div className="text-2xl font-black text-slate-900 flex justify-center sm:justify-start items-center gap-1">
                                        <DollarSign size={24} className="text-emerald-500" /> {job.salary || 'Not Disclosed'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-6">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Posted</div>
                                        <div className="text-sm font-bold text-slate-700 flex items-center gap-2 justify-center sm:justify-start">
                                            <Calendar size={14} /> {formatDate(job.postedAt)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deadline</div>
                                        <div className="text-sm font-bold text-red-600 flex items-center gap-2 justify-center sm:justify-start">
                                            <Clock size={14} /> {job.deadline || 'ASAP'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {user?.role === 'student' ? (
                                    applied ? (
                                        <div className="bg-emerald-50 text-emerald-700 py-4 rounded-2xl flex flex-col items-center justify-center border border-emerald-100">
                                            <CheckCircle2 size={32} className="mb-2" />
                                            <span className="font-bold">Application Sent!</span>
                                        </div>
                                    ) : (
                                        <a
                                            href={job.applyLink || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={job.applyLink ? undefined : handleApply}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                                        >
                                            {job.applyLink ? 'Apply on Company Site' : 'Apply Now'} <Send size={20} />
                                        </a>
                                    )
                                ) : (
                                    <div className="bg-slate-50 text-slate-500 py-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 text-center px-4">
                                        <span className="font-bold text-sm">Login as Student to Apply</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-600 transition-all">
                                        <Bookmark size={18} /> Save
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-600 transition-all">
                                        <Share2 size={18} /> Share
                                    </button>
                                </div>
                            </div>

                            {job.perks && job.perks.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-50">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Role Perks</div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.perks.map((p: string, i: number) => (
                                            <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-100">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
