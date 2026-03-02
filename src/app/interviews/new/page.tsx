'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import {
    Building2,
    Briefcase,
    ArrowLeft,
    Send,
    Tag,
    Plus,
    X,
    Lightbulb,
    FileText
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { InterviewDifficulty, InterviewResult } from '@/types';
import Link from 'next/link';

const NewInterviewPage = () => {
    const { user } = useAuth();
    const router = useRouter();
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
        if (!user) return;
        if (!formData.company || !formData.role || !formData.experience) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, FIRESTORE_COLLECTIONS.INTERVIEW_EXPERIENCES), {
                ...formData,
                userId: user.uid,
                userName: user.name,
                createdAt: serverTimestamp(),
            });
            router.push('/interviews');
        } catch (error) {
            console.error('Error posting experience:', error);
            alert('Failed to post experience. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 pt-24 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h2>
                    <p className="text-slate-500 mb-6">You need to be logged in to share an interview experience.</p>
                    <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">Log In →</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
                <Link href="/interviews" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back to Experiences
                </Link>

                <div className="bg-white rounded-[32px] border-2 border-slate-100 p-6 md:p-10 shadow-sm">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Share Your Interview Experience</h1>
                    <p className="text-slate-500 font-medium mb-8">Help others prepare by sharing your story.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company & Role */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="e.g. Google"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Role Applied *</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="e.g. SDE Intern"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Difficulty & Result */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as InterviewDifficulty })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Result</label>
                                <select
                                    value={formData.result}
                                    onChange={e => setFormData({ ...formData, result: e.target.value as InterviewResult })}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                >
                                    <option value="Selected">Selected</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="In Process">In Process</option>
                                </select>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <FileText size={12} /> Interview Experience *
                            </label>
                            <textarea
                                required
                                rows={8}
                                value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                placeholder="Describe your interview experience — rounds, questions asked, process, etc."
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                            />
                        </div>

                        {/* Preparation Tips */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Lightbulb size={12} /> Preparation Tips
                            </label>
                            <textarea
                                rows={4}
                                value={formData.preparationTips}
                                onChange={e => setFormData({ ...formData, preparationTips: e.target.value })}
                                placeholder="Share tips that helped you prepare — resources, topics to focus on, etc."
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Tag size={12} /> Tags
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder="e.g. DSA, System Design"
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> Publish Experience
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default NewInterviewPage;
