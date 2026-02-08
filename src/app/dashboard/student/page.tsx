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
import { collection, query, limit, getDocs, orderBy, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        const fetchSmartMatches = async () => {
            if (!user) return;
            try {
                // 1. Fetch student profile data (has skills array)
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                const studentData = studentDoc.exists() ? studentDoc.data() : null;

                // 2. Extract keywords from skills
                const stopWords = new Set(['and', 'the', 'for', 'with', 'using', 'from', 'base', 'developer', 'engineer', 'manager', 'intern', 'junior', 'senior']);
                const keywords = new Set<string>();
                const skillKeywords = new Set<string>();

                if (studentData?.skills) {
                    studentData.skills.forEach((s: string) => {
                        const skill = s.toLowerCase().trim();
                        if (skill) {
                            keywords.add(skill);
                            skillKeywords.add(skill);
                            // Also add individual words from multi-word skills
                            skill.split(/[\s\/\-,]+/).forEach((word: string) => {
                                const cleanWord = word.replace(/[^a-z0-9]/g, '');
                                if (cleanWord && cleanWord.length > 2 && !stopWords.has(cleanWord)) {
                                    keywords.add(cleanWord);
                                }
                            });
                        }
                    });
                }

                // Add branch as a keyword
                if (studentData?.branch) {
                    const branch = studentData.branch.toLowerCase();
                    keywords.add(branch);
                    branch.split(' ').forEach((word: string) => {
                        if (word && !stopWords.has(word)) keywords.add(word);
                    });
                }

                // 3. Fetch jobs
                const jobsQuery = query(collection(db, 'jobs'), limit(20));
                const jobsSnap = await getDocs(jobsQuery);
                const allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

                // 4. Score jobs and track matched skills
                const scoredJobs = allJobs.map(job => {
                    let score = 0;
                    const matchedSkills: string[] = [];
                    const jobTitle = job.title?.toLowerCase() || '';
                    const jobDesc = job.description?.toLowerCase() || '';
                    const jobCompany = job.company?.toLowerCase() || '';

                    keywords.forEach(kw => {
                        if (!kw || kw.length < 2) return;
                        let found = false;

                        // Higher weight for title matches
                        if (jobTitle.includes(kw)) {
                            score += 20;
                            found = true;
                        }

                        // Medium weight for description matches
                        if (jobDesc.includes(kw)) {
                            score += 8;
                            found = true;
                        }

                        // Track matched skills for display (limit to 3)
                        if (found && skillKeywords.has(kw) && matchedSkills.length < 3) {
                            const displaySkill = kw.toUpperCase();
                            if (!matchedSkills.includes(displaySkill)) {
                                matchedSkills.push(displaySkill);
                            }
                        }
                    });

                    // Normalize score to percentage (0-100)
                    // If we have keywords, calculate a meaningful score
                    let finalScore = 0;
                    if (keywords.size > 0 && score > 0) {
                        // Use logarithmic scaling for better distribution
                        finalScore = Math.min(98, Math.floor(50 + Math.log(score + 1) * 10));
                    }

                    return { ...job, matchScore: finalScore, matchedSkills };
                });

                // 5. Sort by score and take top 3
                const topJobs = scoredJobs
                    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                    .slice(0, 3);

                setJobs(topJobs);
            } catch (error) {
                console.error("Error fetching matches:", error);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchSmartMatches();
    }, [user]);

    const [stats, setStats] = useState([
        { label: 'Applied Jobs', value: 0, icon: <Briefcase className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Shortlisted', value: 0, icon: <CheckCircle2 className="text-emerald-600" />, color: 'bg-emerald-50' },
        { label: 'Pending', value: 0, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
        { label: 'Profile Score', value: '0%', icon: <TrendingUp className="text-indigo-600" />, color: 'bg-indigo-50' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                // Fetch Applications
                const appsQuery = query(collection(db, 'users', user.uid, 'applications'));
                const appsSnap = await getDocs(appsQuery);
                const appliedCount = appsSnap.size;
                const shortlistedCount = appsSnap.docs.filter(doc => doc.data().status === 'Shortlisted').length;
                const pendingCount = appsSnap.docs.filter(doc => doc.data().status === 'Pending').length;

                // Fetch Profile Score
                let profileScore = 0;
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                if (studentDoc.exists()) {
                    profileScore = studentDoc.data().analysisResult?.score || 0;
                }

                setStats([
                    { label: 'Applied Jobs', value: appliedCount, icon: <Briefcase className="text-indigo-600" />, color: 'bg-indigo-50' },
                    { label: 'Shortlisted', value: shortlistedCount, icon: <CheckCircle2 className="text-emerald-600" />, color: 'bg-emerald-50' },
                    { label: 'Pending', value: pendingCount, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
                    { label: 'Profile Score', value: `${profileScore}%`, icon: <TrendingUp className="text-indigo-600" />, color: 'bg-indigo-50' },
                ]);

            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, [user]);

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
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                                <Briefcase size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black">AI Job Matcher</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Jobs Aligned With Your Resume</span>
                            </div>
                        </h2>
                        <Link href="/jobs" className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 group mb-2">
                            Explore All <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
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
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    className="bg-white border border-slate-100 p-6 rounded-[32px] flex justify-between items-center cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-50"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-50 font-black text-slate-900 text-2xl shadow-sm overflow-hidden">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                                            ) : (
                                                job.company?.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg leading-tight">{job.title}</h3>
                                            <p className="text-sm font-bold text-slate-400 mb-2">{job.company}</p>
                                            <div className="flex gap-2">
                                                {job.matchedSkills?.map((skill: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-500 rounded-lg uppercase tracking-wider border border-slate-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(!job.matchedSkills || job.matchedSkills.length === 0) && (
                                                    <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 rounded-lg uppercase tracking-wider border border-slate-100">
                                                        Match based on experience
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-2xl font-black text-emerald-500">{job.matchScore}%</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Skill Match</div>
                                    </div>
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
