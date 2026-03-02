'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock,
    Lightbulb,
    Pencil,
    Tag,
    User,
    Calendar
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { InterviewExperience } from '@/types';

const difficultyColors: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Hard: 'bg-red-100 text-red-700 border-red-200',
};

const resultConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    Selected: { icon: <CheckCircle2 size={18} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    Rejected: { icon: <XCircle size={18} />, color: 'bg-red-50 text-red-600 border-red-200' },
    'In Process': { icon: <Clock size={18} />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
};

const InterviewDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [experience, setExperience] = useState<InterviewExperience | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const docRef = doc(db, FIRESTORE_COLLECTIONS.INTERVIEW_EXPERIENCES, params.id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setExperience({ id: docSnap.id, ...docSnap.data() } as InterviewExperience);
                }
            } catch (error) {
                console.error('Error fetching experience:', error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchExperience();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex justify-center pt-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!experience) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 pt-24 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Experience Not Found</h2>
                    <Link href="/interviews" className="text-indigo-600 font-bold hover:underline">← Back to Experiences</Link>
                </div>
            </div>
        );
    }

    const rc = resultConfig[experience.result];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/interviews" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                        <ArrowLeft size={18} /> All Experiences
                    </Link>
                    {user && user.uid === experience.userId && (
                        <Link
                            href={`/interviews/${experience.id}/edit`}
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                        >
                            <Pencil size={16} /> Edit
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-[32px] border-2 border-slate-100 p-6 md:p-10 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start gap-5 mb-8">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl flex-shrink-0">
                            {experience.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{experience.company}</h1>
                            <p className="text-lg text-indigo-600 font-bold flex items-center gap-2 mt-1">
                                <Briefcase size={18} /> {experience.role}
                            </p>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${difficultyColors[experience.difficulty]}`}>
                            {experience.difficulty} Difficulty
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border ${rc.color}`}>
                            {rc.icon} {experience.result}
                        </span>
                    </div>

                    {/* Experience */}
                    <div className="mb-8">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Interview Experience</h2>
                        <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {experience.experience}
                        </div>
                    </div>

                    {/* Preparation Tips */}
                    {experience.preparationTips && (
                        <div className="mb-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                            <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lightbulb size={14} /> Preparation Tips
                            </h2>
                            <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                {experience.preparationTips}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {experience.tags.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Tag size={12} /> Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {experience.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Info */}
                    <div className="pt-6 border-t border-slate-100 flex items-center gap-3 text-sm text-slate-400 font-medium">
                        <User size={16} />
                        <span>Shared by <strong className="text-slate-600">{experience.userName}</strong></span>
                        <span className="text-slate-200">|</span>
                        <Calendar size={14} />
                        <span>
                            {experience.createdAt && typeof experience.createdAt === 'object' && 'toDate' in experience.createdAt
                                ? (experience.createdAt as any).toDate().toLocaleDateString()
                                : 'Recently'}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InterviewDetailPage;
