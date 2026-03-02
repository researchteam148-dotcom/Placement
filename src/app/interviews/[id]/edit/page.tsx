'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
    Building2,
    Briefcase,
    ArrowLeft,
    Save,
    Tag,
    Plus,
    X,
    Lightbulb,
    FileText
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { InterviewDifficulty, InterviewResult, InterviewExperience } from '@/types';

const EditInterviewPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        difficulty: 'Medium' as InterviewDifficulty,
        result: 'Selected' as InterviewResult,
        experience: '',
        preparationTips: '',
        tags: [] as string[],
    });

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const docRef = doc(db, FIRESTORE_COLLECTIONS.INTERVIEW_EXPERIENCES, params.id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as InterviewExperience;
                    if (user && data.userId !== user.uid) {
                        router.push('/interviews');
                        return;
                    }
                    setFormData({
                        company: data.company,
                        role: data.role,
                        difficulty: data.difficulty,
                        result: data.result,
                        experience: data.experience,
                        preparationTips: data.preparationTips || '',
                        tags: data.tags || [],
                    });
                } else {
                    router.push('/interviews');
                }
            } catch (error) {
                console.error('Error fetching experience:', error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id && user) fetchExperience();
    }, [params.id, user, router]);

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !params.id) return;

        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, FIRESTORE_COLLECTIONS.INTERVIEW_EXPERIENCES, params.id as string), {
                ...formData,
                updatedAt: serverTimestamp(),
            });
            router.push(`/interviews/${params.id}`);
        } catch (error) {
            console.error('Error updating experience:', error);
            alert('Failed to update. Please try again.');
            setIsSubmitting(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
                <Link href={`/interviews/${params.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <ArrowLeft size={18} /> Cancel
                </Link>

                <div className="bg-white rounded-[32px] border-2 border-slate-100 p-6 md:p-10 shadow-sm">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Edit Experience</h1>
                    <p className="text-slate-500 font-medium mb-8">Update your interview story.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" required value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Role *</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" required value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold" />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                                <select value={formData.difficulty}
                                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as InterviewDifficulty })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Result</label>
                                <select value={formData.result}
                                    onChange={e => setFormData({ ...formData, result: e.target.value as InterviewResult })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold">
                                    <option value="Selected">Selected</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="In Process">In Process</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <FileText size={12} /> Interview Experience *
                            </label>
                            <textarea required rows={8} value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Lightbulb size={12} /> Preparation Tips
                            </label>
                            <textarea rows={4} value={formData.preparationTips}
                                onChange={e => setFormData({ ...formData, preparationTips: e.target.value })}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium resize-none" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Tag size={12} /> Tags
                            </label>
                            <div className="flex gap-2">
                                <input type="text" value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder="Add tag..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" />
                                <button type="button" onClick={addTag}
                                    className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Saving...</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditInterviewPage;
