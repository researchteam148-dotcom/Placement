'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    FileText,
    Upload,
    Sparkles,
    CheckCircle2,
    Loader2,
    Save,
    Trash2,
    ArrowRight,
    History,
    Briefcase,
    Zap,
    Download,
    ExternalLink,
    Clock,
    UserCheck,
    Check
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, collection, query, orderBy, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const ResumeHub = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [resumeURL, setResumeURL] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [savedResumes, setSavedResumes] = useState<any[]>([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    setResumeURL(data.resumeURL || '');
                    setAnalysisResult(data.analysisResult || null);
                }
            }
        };
        fetchStudentData();
    }, [user]);

    // Fetch Saved Resumes Real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'students', user.uid, 'savedResumes'), orderBy('lastUpdated', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const resumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavedResumes(resumes);
        });
        return () => unsubscribe();
    }, [user]);

    const deleteResume = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            await deleteDoc(doc(db, 'students', user.uid!, 'savedResumes', id));
        } catch (error) {
            console.error("Error deleting resume:", error);
            alert("Failed to delete resume.");
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validation: Max size 700KB (Firestore limit is 1MB, safe margin)
        if (file.size > 700 * 1024) {
            alert('Free Tier Limit: File must be smaller than 700KB. Please compress your PDF or upgrade to use larger files.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64String = event.target?.result as string;

                try {
                    // Store directly in Firestore
                    // We use setDoc with merge: true to ensure the document exists
                    // This creates the user profile if it doesn't exist yet.

                    await setDoc(doc(db, 'students', user.uid), {
                        resumeURL: base64String, // Browser treats Data URLs just like HTTPS URLs
                        resumeFileName: file.name
                    }, { merge: true });

                    setResumeURL(base64String);
                    alert('Resume stored successfully (Free Tier)!');
                } catch (err: any) {
                    console.error("Firestore Save Error:", err);
                    // Show the actual error message
                    alert(`Failed to save: ${err.message}`);
                } finally {
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };

            reader.onerror = (error) => {
                console.error("File Reading Error:", error);
                alert("Failed to read file.");
                setUploading(false);
            };

            reader.readAsDataURL(file);

        } catch (error: any) {
            console.error("Unexpected error:", error);
            alert(`An unexpected error occurred: ${error.message}`);
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const runAnalysis = async () => {
        if (!resumeURL || !user) return;
        setAnalyzing(true);
        try {
            // Call our new AI endpoint
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeURL }) // Sending the Base64 string
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Analysis failed');
            }

            const result = await response.json();

            // Save result to Firestore so we don't have to re-analyze every time
            await updateDoc(doc(db, 'students', user!.uid), {
                analysisResult: result
            });

            setAnalysisResult(result);
            alert('Resume analysis complete!');

        } catch (error: any) {
            console.error("Analysis Error:", error);
            alert(`AI Analysis failed: ${error.message}. Please check your API key.`);
        } finally {
            setAnalyzing(false);
        }
    };

    const recommendations = [
        { id: 1, title: 'Frontend Developer', company: 'TechFlow', match: '95%', tags: ['React', 'Tailwind'] },
        { id: 2, title: 'Product Designer', company: 'CreativeCo', match: '88%', tags: ['Figma', 'UI/UX'] },
        { id: 3, title: 'Growth Intern', company: 'SkyHigh', match: '82%', tags: ['Python', 'Analysis'] },
    ];

    return (
        <div className="min-h-screen mesh-gradient overflow-x-hidden">
            <Navbar />
            <div className="pt-24 pb-20 px-6">
                <main className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center sm:items-end gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-center sm:text-left"
                        >
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Resume <span className="text-indigo-600">Architect</span></h1>
                            <p className="text-lg text-slate-500 mt-2 font-medium capitalize">Master your professional narrative with AI-powered tools.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Link href="/dashboard/student/resume-builder" className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 group">
                                <Zap size={20} className="group-hover:text-amber-400 group-hover:scale-110 transition-all" />
                                Launch AI Builder
                            </Link>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Main Tools */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Active Resume Card */}
                            <div className="glass-card p-10 rounded-[40px] space-y-8 relative overflow-hidden group">
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className={`w-32 h-40 rounded-[28px] flex items-center justify-center border-2 transition-all duration-500 ${resumeURL ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
                                        {resumeURL ? (
                                            <FileText size={64} className="text-indigo-600 drop-shadow-lg" />
                                        ) : (
                                            <Upload size={48} className="text-slate-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">Active Profile Resume</h3>
                                            <p className="text-slate-500 font-medium">This file is shared with recruiters during applications.</p>
                                        </div>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleResumeUpload}
                                            />
                                            {resumeURL ? (
                                                <>
                                                    <a href={resumeURL} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-slate-100 hover:border-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                                                        <ExternalLink size={18} /> View
                                                    </a>
                                                    <a href={resumeURL} download className="bg-white border-2 border-slate-100 hover:border-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                                                        <Download size={18} /> Download
                                                    </a>
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100 transition-all"
                                                    >
                                                        <Upload size={18} /> Update
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    {uploading ? 'Uploading...' : 'Upload Resume'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
                            </div>

                            {/* Job Recommendations Section */}
                            <div className="glass-card p-10 rounded-[40px] space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Job Matcher</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Jobs aligned with your resume</p>
                                        </div>
                                    </div>
                                    <Link href="/jobs" className="text-sm font-black text-indigo-600 hover:underline underline-offset-4 uppercase tracking-widest">
                                        Explore All
                                    </Link>
                                </div>

                                <div className="grid gap-4">
                                    {recommendations.map((job) => (
                                        <div key={job.id} className="p-6 bg-slate-50/50 hover:bg-white rounded-[28px] border-2 border-transparent hover:border-indigo-100 transition-all group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-100/20">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl border-2 border-slate-50 group-hover:border-indigo-50 shadow-sm transition-all">
                                                        {job.company.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-lg">{job.title}</h4>
                                                        <p className="text-slate-500 font-bold mb-1">{job.company}</p>
                                                        <div className="flex gap-2">
                                                            {job.tags.map(t => (
                                                                <span key={t} className="px-2 py-0.5 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded-md">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-emerald-500 font-black text-2xl tracking-tighter">{job.match}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Match</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* AI Audit Sidecard */}
                            <div className={`rounded-[40px] p-8 relative overflow-hidden group shadow-2xl transition-all ${analysisResult ? 'bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 text-white shadow-indigo-200' : 'bg-white border-2 border-slate-100 shadow-slate-100'}`}>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className={analysisResult ? "text-amber-400" : "text-indigo-600"} size={22} />
                                            <h3 className="font-black text-lg uppercase tracking-widest">Resume Audit</h3>
                                        </div>
                                        {analysisResult && (
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black border border-white/20">
                                                {analysisResult.score}/100
                                            </div>
                                        )}
                                    </div>

                                    {!analysisResult ? (
                                        <div className="text-center space-y-6 py-6">
                                            <p className="text-slate-500 font-medium">Get instant feedback on your resume using our advanced AI algorithms.</p>
                                            <button
                                                onClick={runAnalysis}
                                                disabled={analyzing || !resumeURL}
                                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                            >
                                                {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                                {analyzing ? 'Analyzing...' : 'Start Review'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="text-[10px] uppercase font-black text-indigo-300 tracking-[0.2em]">Key Improvements</div>
                                                {analysisResult.suggestions.map((s: string, i: number) => (
                                                    <div key={i} className="text-xs flex gap-3 items-start leading-relaxed font-bold bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                                        <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 border border-white/10">
                                                            <Check size={10} />
                                                        </div>
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={runAnalysis}
                                                className="w-full bg-white text-indigo-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
                                            >
                                                Rescan Document
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <Sparkles className="absolute -bottom-6 -right-6 text-white/5 w-48 h-48 -rotate-12 group-hover:scale-125 transition-transform duration-1000" />
                            </div>

                            {/* Version History (Placeholder) */}
                            <div className="glass-card p-8 rounded-[40px] space-y-6 shadow-xl shadow-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-xl text-white">
                                            <History size={18} />
                                        </div>
                                        <h3 className="font-black text-lg uppercase tracking-widest text-slate-900">My Resumes</h3>
                                    </div>
                                    <Link href="/dashboard/student/resume-builder" className="text-xs font-bold text-indigo-600 hover:underline">
                                        + Create New
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {savedResumes.length === 0 ? (
                                        <div className="text-center py-6 text-slate-400 text-sm font-medium">
                                            No saved resumes yet. Start building!
                                        </div>
                                    ) : (
                                        savedResumes.map((resume) => (
                                            <div key={resume.id} className="p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-indigo-100 transition-all flex items-center justify-between group relative">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText className="text-indigo-600" size={20} />
                                                    <div className="overflow-hidden">
                                                        <div className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">{resume.name || 'Untitled Resume'}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">
                                                            {resume.lastUpdated?.toDate().toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/dashboard/student/resume-builder?id=${resume.id}`}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        title="Edit Resume"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteResume(resume.id)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete Resume"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResumeHub;
