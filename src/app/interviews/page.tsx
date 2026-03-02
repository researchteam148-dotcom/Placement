'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import {
    Search,
    Plus,
    Briefcase,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { InterviewExperience } from '@/types';

const difficultyColors: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    Hard: 'bg-red-100 text-red-700',
};

const resultIcons: Record<string, React.ReactNode> = {
    Selected: <CheckCircle2 size={14} className="text-emerald-600" />,
    Rejected: <XCircle size={14} className="text-red-500" />,
    'In Process': <Clock size={14} className="text-amber-500" />,
};

const InterviewsPage = () => {
    const { user } = useAuth();
    const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterResult, setFilterResult] = useState('All');

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const q = query(
                    collection(db, FIRESTORE_COLLECTIONS.INTERVIEW_EXPERIENCES),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                setExperiences(
                    snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InterviewExperience))
                );
            } catch (error) {
                console.error('Error fetching experiences:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExperiences();
    }, []);

    const filtered = experiences.filter(exp => {
        const matchesSearch =
            exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDiff = filterDifficulty === 'All' || exp.difficulty === filterDifficulty;
        const matchesResult = filterResult === 'All' || exp.result === filterResult;
        return matchesSearch && matchesDiff && matchesResult;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Interview Experiences
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Learn from real interview stories and ace your next interview.
                        </p>
                    </div>
                    {user && (
                        <Link
                            href="/interviews/new"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 flex-shrink-0"
                        >
                            <Plus size={20} /> Share Your Experience
                        </Link>
                    )}
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by company, role, or tag..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filterDifficulty}
                            onChange={e => setFilterDifficulty(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="All">All Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <select
                            value={filterResult}
                            onChange={e => setFilterResult(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="All">All Results</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                            <option value="In Process">In Process</option>
                        </select>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No experiences found</h3>
                        <p className="text-slate-400 font-medium">Be the first to share an interview story!</p>
                        {user && (
                            <Link
                                href="/interviews/new"
                                className="inline-flex items-center gap-2 mt-6 text-indigo-600 font-bold hover:underline"
                            >
                                Share Now <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((exp, i) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link href={`/interviews/${exp.id}`}>
                                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-lg transition-all group h-full flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                                                {exp.company.charAt(0)}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[exp.difficulty]}`}>
                                                {exp.difficulty}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {exp.company}
                                        </h3>
                                        <p className="text-sm text-indigo-600 font-bold mb-3 flex items-center gap-1">
                                            <Briefcase size={14} /> {exp.role}
                                        </p>

                                        <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-4 flex-1">
                                            {exp.experience}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                {resultIcons[exp.result]}
                                                <span className="text-slate-600">{exp.result}</span>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                {exp.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {exp.tags.length > 2 && (
                                                    <span className="text-[10px] text-slate-400 font-bold">+{exp.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default InterviewsPage;
