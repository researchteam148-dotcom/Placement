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
    AlertCircle,
    X,
    Upload
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, getDocs } from 'firebase/firestore';

const JobDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params);
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applied, setApplied] = useState(false);

    // Application Modal State
    const [showModal, setShowModal] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResume, setSelectedResume] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

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

    // Check if already applied
    useEffect(() => {
        const checkApplication = async () => {
            if (user && id) {
                const appDoc = await getDoc(doc(db, 'users', user.uid, 'applications', id));
                if (appDoc.exists()) {
                    setApplied(true);
                }
            }
        };
        checkApplication();
    }, [user, id]);

    // Fetch Resumes when modal opens
    useEffect(() => {
        const fetchResumes = async () => {
            if (showModal && user) {
                const q = query(collection(db, 'students', user.uid, 'savedResumes'), orderBy('uploadedAt', 'desc'));
                const snapshot = await getDocs(q);
                setResumes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        };
        fetchResumes();
    }, [showModal, user]);

    const handleApplyClick = () => {
        if (!user) {
            alert("Please login to apply");
            return;
        }
        if (user.role !== 'student') {
            alert("Only students can apply for jobs.");
            return;
        }
        setShowModal(true);
    };

    const confirmApply = async () => {
        if (!selectedResume) {
            alert("Please select a resume to proceed.");
            return;
        }

        setSubmitting(true);
        try {
            const applicationData = {
                jobId: id,
                title: job.title,
                company: job.company,
                status: 'Pending',
                appliedAt: new Date().toISOString(),
                applicantId: user!.uid,
                applicantName: user!.name || user!.email,
                applicantEmail: user!.email,
                logo: job.logo || null,
                resumeUrl: selectedResume.url,
                resumeName: selectedResume.name
            };

            // 1. Add to user's applications subcollection (for Student view)
            await setDoc(doc(db, 'users', user!.uid, 'applications', id), applicationData);

            // 2. Add to job's applications subcollection (for Recruiter/Admin view)
            await setDoc(doc(db, 'jobs', id, 'applications', user!.uid), applicationData);

            // 3. Increment applicant count on job document
            const jobRef = doc(db, 'jobs', id);
            await updateDoc(jobRef, {
                applicants: increment(1)
            });

            setApplied(true);
            setShowModal(false);
            alert("Application submitted successfully!");
        } catch (error) {
            console.error("Error applying:", error);
            alert("Failed to apply. Please try again.");
        } finally {
            setSubmitting(false);
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

            {/* Application Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Apply to {job.company}</h3>
                                    <p className="text-sm text-slate-500 font-bold">{job.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select Resume</h4>

                                    {resumes.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                                            <p className="text-slate-500 font-bold mb-4">No resumes found</p>
                                            <Link
                                                href="/profile"
                                                className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline"
                                            >
                                                <Upload size={16} /> Upload in Profile
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                            {resumes.map((resume) => (
                                                <div
                                                    key={resume.id}
                                                    onClick={() => setSelectedResume(resume)}
                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedResume?.id === resume.id
                                                            ? 'border-indigo-600 bg-indigo-50'
                                                            : 'border-slate-100 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-xl ${selectedResume?.id === resume.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`font-bold ${selectedResume?.id === resume.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                            {resume.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                            {new Date(resume.uploadedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {selectedResume?.id === resume.id && <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        By applying, you agree to share your selected resume and profile details with <strong>{job.company}</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApply}
                                    disabled={!selectedResume || submitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {submitting ? 'Sending...' : 'Confirm Application'}
                                    {!submitting && <Send size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                            onClick={(e) => {
                                                if (!job.applyLink) {
                                                    e.preventDefault();
                                                    handleApplyClick();
                                                }
                                                // If applyLink exists, let it open in new tab (Off-campus behavior)
                                            }}
                                            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
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
