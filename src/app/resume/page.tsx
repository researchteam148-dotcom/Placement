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
    const [jobDescription, setJobDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [savedResumes, setSavedResumes] = useState<any[]>([]);
    const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    // We no longer auto-set resumeURL or analysisResult to ensure a fresh session on refresh
                    // But we still fetch user data if needed for other UI parts
                }
            }
        };
        fetchStudentData();
    }, [user]);

    // Fetch Saved Resumes Real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'students', user.uid, 'savedResumes'), orderBy('uploadedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const resumes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavedResumes(resumes);
        });
        return () => unsubscribe();
    }, [user]);

    // Fetch Analysis History Real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'students', user.uid, 'analysisHistory'), orderBy('analyzedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnalysisHistory(history);
        });
        return () => unsubscribe();
    }, [user]);

    const deleteResume = async (id: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            await deleteDoc(doc(db, 'students', user.uid, 'savedResumes', id));
        } catch (error) {
            console.error("Error deleting resume:", error);
            alert("Failed to delete resume.");
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validation: Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('File must be smaller than 5MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {

            // Create a storage reference from our storage service
            const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // Progress tracking can be added to UI if needed
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Firebase Storage Upload error:", error);
                    alert(`Upload failed: ${error.message}`);
                    setUploading(false);
                },
                async () => {
                    // Handle successful uploads on complete
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Save URL to Firestore
                    await setDoc(doc(db, 'students', user.uid), {
                        resumeURL: downloadURL,
                        resumeFileName: file.name,
                        storageLocation: `resumes/${user.uid}/${file.name}` // Optional: track the storage path
                    }, { merge: true });

                    setResumeURL(downloadURL);
                    alert('Resume uploaded to Firebase Storage successfully!');
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            );

        } catch (error: any) {
            console.error("Comprehensive Upload error:", error);
            alert(`Upload failed: ${error.message}`);
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const selectResume = (resume: any) => {
        setSelectedResumeId(resume.id);
        setResumeURL(resume.url);
    };

    const viewHistoryItem = (historyItem: any) => {
        setAnalysisResult(historyItem.analysisResult);
        setResumeURL(historyItem.resumeUrl);
        setJobDescription(historyItem.jobDescription || '');
    };

    const runAnalysis = async () => {
        if (!resumeURL || !user) return;
        setAnalyzing(true);
        try {
            // Call our new AI endpoint
            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeURL, jobDescription })
            });

            if (!response.ok) {
                let errorMessage = 'Analysis failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorData.error || errorMessage;
                } catch (e) {
                    try {
                        const textError = await response.text();
                        console.error("Non-JSON error response:", textError);
                        errorMessage = `Server error (${response.status}): ${response.statusText}`;
                    } catch (textErr) {
                        errorMessage = `Network error (${response.status})`;
                    }
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Save result to current student document
            await updateDoc(doc(db, 'students', user.uid), {
                analysisResult: result
            });

            // IMPROVED: Save to analysis history
            const selectedResume = savedResumes.find(r => r.url === resumeURL);
            await setDoc(doc(collection(db, 'students', user.uid, 'analysisHistory')), {
                resumeUrl: resumeURL,
                resumeName: selectedResume?.name || 'Uploaded Resume',
                analysisResult: result,
                jobDescription: jobDescription || null,
                analyzedAt: new Date().toISOString(),
                score: result.score || 0
            });

            setAnalysisResult(result);
            alert('Resume analysis complete and saved to history!');

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

                            {/* Resume Selector - NEW */}
                            {savedResumes.length > 0 && (
                                <div className="glass-card p-8 rounded-[40px] space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900">Select from Your Resumes</h3>
                                        <span className="text-sm text-slate-500 font-medium">{savedResumes.length} uploaded</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {savedResumes.map((resume) => (
                                            <motion.div
                                                key={resume.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => selectResume(resume)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedResumeId === resume.id
                                                        ? 'bg-indigo-50 border-indigo-600'
                                                        : 'bg-white border-slate-100 hover:border-indigo-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <FileText className={`shrink-0 ${selectedResumeId === resume.id ? 'text-indigo-600' : 'text-slate-400'}`} size={24} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{resume.name}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {new Date(resume.uploadedAt).toLocaleDateString()} • {(resume.size / 1024).toFixed(0)} KB
                                                        </div>
                                                    </div>
                                                    {selectedResumeId === resume.id && (
                                                        <Check className="text-indigo-600 shrink-0" size={20} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Analysis History - NEW */}
                            {analysisHistory.length > 0 && (
                                <div className="glass-card p-8 rounded-[40px] space-y-6">
                                    <div className="flex items-center gap-3">
                                        <History className="text-indigo-600" size={24} />
                                        <h3 className="text-xl font-black text-slate-900">Analysis History</h3>
                                        <span className="text-sm text-slate-500 font-medium">({analysisHistory.length})</span>
                                    </div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {analysisHistory.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => viewHistoryItem(item)}
                                                className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-300 cursor-pointer transition-all"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{item.resumeName}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock size={12} className="text-slate-400" />
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(item.analyzedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        {item.jobDescription && (
                                                            <div className="text-xs text-indigo-600 mt-1 truncate">
                                                                For: {item.jobDescription.substring(0, 50)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-center">
                                                        <div className="text-2xl font-black text-indigo-600">{item.score}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Enhanced AI Audit Dashboard */}
                            <AnimatePresence>
                                {analysisResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        {/* Row 1: Dashboard Overview (Full Width in Main Col) */}
                                        <div className="glass-card p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-10">
                                            <div className="relative w-40 h-40 shrink-0">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="80" cy="80" r="70" className="fill-none stroke-slate-100 stroke-[10]" />
                                                    <motion.circle
                                                        cx="80" cy="80" r="70"
                                                        className="fill-none stroke-indigo-600 stroke-[12] stroke-round"
                                                        initial={{ strokeDasharray: "0, 440" }}
                                                        animate={{ strokeDasharray: `${(analysisResult.score / 100) * 440}, 440` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-black text-slate-900">{analysisResult.score}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Overall</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-6">
                                                <h3 className="text-2xl font-black text-slate-900">Good Job! Your resume is looking strong.</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {Object.entries(analysisResult.categories || {}).map(([key, cat]: [string, any], i: number) => (
                                                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{cat.label || key}</div>
                                                            <div className="flex justify-between items-end">
                                                                <div className="text-lg font-black text-slate-900">{cat.score}%</div>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${cat.score > 80 ? 'bg-emerald-500' : cat.score > 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Top Fixes & Detailed Feedback */}
                                        <div className="grid md:grid-cols-12 gap-8">
                                            {/* Top Fixes (Left) */}
                                            <div className="md:col-span-4 space-y-6 text-left">
                                                <div className="glass-card p-8 rounded-[32px] border-l-4 border-l-indigo-600 h-full">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Top Fixes</h4>
                                                    <div className="space-y-4">
                                                        {analysisResult.topFixes?.length > 0 ? (
                                                            analysisResult.topFixes.map((fix: any, i: number) => (
                                                                <div key={i} className="flex justify-between items-center group cursor-help">
                                                                    <span className="text-sm font-bold text-slate-700">{fix.category}</span>
                                                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${fix.status === 'critical' ? 'bg-red-50 text-red-500' :
                                                                        fix.status === 'warning' ? 'bg-amber-50 text-amber-500' :
                                                                            'bg-emerald-50 text-emerald-500'
                                                                        }`}>
                                                                        {fix.score}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-medium italic">All major checks passed!</p>
                                                        )}
                                                    </div>

                                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">JD Match</h4>
                                                        {analysisResult.jdMatch ? (
                                                            <div className="space-y-3">
                                                                <div className="text-3xl font-black text-slate-900">{analysisResult.jdMatch.score}%</div>
                                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{analysisResult.jdMatch.summary}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-slate-400 font-medium italic">Compare with JD to see match.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed Strengths & Suggestions (Right) */}
                                            <div className="md:col-span-8 space-y-6 text-left">
                                                <div className="glass-card p-8 rounded-[32px] space-y-4 border border-emerald-100">
                                                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle2 size={16} /> Key Strengths
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {analysisResult.strengths?.map((s: string, i: number) => (
                                                            <li key={i} className="text-sm font-medium text-slate-600 flex gap-3">
                                                                <span className="text-emerald-500 shrink-0">•</span> <span>{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="glass-card p-8 rounded-[32px] space-y-4 border border-indigo-100">
                                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                                        <Sparkles size={16} /> Suggestions
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {analysisResult.suggestions?.map((s: string, i: number) => (
                                                            <li key={i} className="text-sm font-medium text-slate-600 flex gap-3">
                                                                <span className="text-indigo-500 shrink-0">•</span> <span>{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Job Description Input (New) */}
                            <div className="glass-card p-8 rounded-[40px] space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-900 p-2 rounded-xl text-white">
                                        <Briefcase size={18} />
                                    </div>
                                    <h3 className="font-black text-lg uppercase tracking-widest text-slate-900">Target Role</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Paste the job description you&apos;re applying for to get a specialized match score.</p>
                                    <textarea
                                        rows={5}
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste JD here..."
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm font-medium"
                                    />
                                    <button
                                        onClick={runAnalysis}
                                        disabled={analyzing || !resumeURL}
                                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Compare Resume
                                    </button>
                                </div>
                            </div>

                            {/* AI Audit Sidecard (Updated) */}
                            <div className={`rounded-[40px] p-8 relative overflow-hidden group shadow-2xl transition-all border-2 ${analysisResult ? 'bg-white border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="text-indigo-600" size={22} />
                                            <h3 className="font-black text-lg uppercase tracking-widest text-slate-900">Resume Audit</h3>
                                        </div>
                                    </div>

                                    {!analysisResult && (
                                        <div className="text-center space-y-6 py-6 border-2 border-dashed border-slate-200 rounded-3xl p-6">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                                <Zap className="text-indigo-500" size={32} />
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm">Upload a resume and start your professional audit.</p>
                                            <button
                                                onClick={runAnalysis}
                                                disabled={analyzing || !resumeURL}
                                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                            >
                                                {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                                {analyzing ? 'Analyzing...' : 'Start Review'}
                                            </button>
                                        </div>
                                    )}

                                    {analysisResult && (
                                        <div className="space-y-4 text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 text-2xl font-black mb-2 border border-indigo-100">
                                                {analysisResult.score}
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium">Your audit is complete. View the detailed report on the left.</p>
                                            <button
                                                onClick={runAnalysis}
                                                className="w-full bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all active:scale-95"
                                            >
                                                Rescan Document
                                            </button>
                                        </div>
                                    )}
                                </div>
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
