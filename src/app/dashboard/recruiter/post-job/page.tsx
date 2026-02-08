'use client';

import React, { useState } from 'react';
import {
    Briefcase,
    Plus,
    MapPin,
    Calendar,
    CheckCircle2,
    X,
    Building2,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const PostJobPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [perks, setPerks] = useState<string[]>([]);
    const [newPerk, setNewPerk] = useState('');

    // Admin specific state
    const [recruiters, setRecruiters] = useState<any[]>([]);
    const [selectedRecruiter, setSelectedRecruiter] = useState<any>(null);

    React.useEffect(() => {
        if (user?.role === 'admin') {
            const fetchRecruiters = async () => {
                const q = query(collection(db, 'users'), where('role', '==', 'recruiter'));
                const snapshot = await getDocs(q);
                setRecruiters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            };
            fetchRecruiters();
        }
    }, [user]);
    const [jobData, setJobData] = useState({
        title: '',
        company: '',
        employmentType: 'Full-time', // Renamed from type to prevent collision
        salary: '',
        location: '',
        description: '',
        deadline: '',
        applyLink: ''
    });

    const addPerk = () => {
        if (newPerk.trim()) {
            setPerks([...perks, newPerk]);
            setNewPerk('');
        }
    };

    const removePerk = (index: number) => {
        setPerks(perks.filter((_, i) => i !== index));
    };

    const handlePublish = async () => {
        if (!user) {
            alert('Please login to post a job');
            return;
        }

        // Basic validation
        if (!jobData.title || !jobData.location || !jobData.description || (user.role === 'admin' && !selectedRecruiter) || (user.role === 'recruiter' && !jobData.company)) {
            alert('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'jobs'), {
                ...jobData,
                company: user.role === 'admin' ? selectedRecruiter?.name : jobData.company, // Auto-fill company if admin selects recruiter
                perks,
                postedBy: user.role === 'admin' ? selectedRecruiter?.id : user.uid,
                postedByName: user.role === 'admin' ? selectedRecruiter?.name : user.name,
                postedAt: new Date().toISOString(),
                type: 'On-Campus', // Keeps the main category as On-Campus
                applicants: 0
            });
            alert('Job posted successfully! Students can now see this opening.');
            // Reset form
            setJobData({
                title: '',
                company: '',
                employmentType: 'Full-time',
                salary: '',
                location: '',
                description: '',
                deadline: '',
                applyLink: ''
            });
            setPerks([]);
        } catch (error: any) {
            console.error("Error posting job:", error);
            alert(`Failed to post job: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Post a New Opening</h1>
                <p className="text-slate-500 mt-1">Fill in the details to find the best candidates.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-10">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-600" /> Basic Information
                        </h2>
                        {user?.role === 'admin' && (
                            <div className="w-1/2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Post on behalf of</label>
                                <select
                                    className="w-full px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    onChange={(e) => {
                                        const recruiter = recruiters.find(r => r.id === e.target.value);
                                        setSelectedRecruiter(recruiter);
                                        if (recruiter) {
                                            setJobData(prev => ({ ...prev, company: recruiter.name || '' }));
                                        }
                                    }}
                                >
                                    <option value="">Select Company / Recruiter</option>
                                    {recruiters.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Job Title / Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={jobData.title}
                                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={jobData.company}
                                    onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Job Type</label>
                            <select
                                value={jobData.employmentType}
                                onChange={(e) => setJobData({ ...jobData, employmentType: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none font-semibold text-slate-700"
                            >
                                <option>Full-time</option>
                                <option>Internship</option>
                                <option>Contract</option>
                                <option>Remote</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={jobData.location}
                                    onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                                    placeholder="e.g. Bangalore, India"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Package (CTC)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="text"
                                    value={jobData.salary}
                                    onChange={(e) => setJobData({ ...jobData, salary: e.target.value })}
                                    placeholder="e.g. 12 LPA - 18 LPA"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Application Deadline</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={jobData.deadline}
                                    onChange={(e) => setJobData({ ...jobData, deadline: e.target.value })}
                                    placeholder="e.g. 30th Nov, 2026"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FileText size={14} /> Job Description (JD)
                        </label>
                        <textarea
                            rows={8}
                            value={jobData.description}
                            onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                            placeholder="Detailed job description, responsibilities, and requirements..."
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium leading-relaxed"
                        ></textarea>
                    </div>
                </div>

                {/* Benefits/Perks */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <CheckCircle2 size={14} /> Perks & Benefits
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a benefit (e.g. Health Insurance)"
                                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                value={newPerk}
                                onChange={(e) => setNewPerk(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPerk()}
                            />
                            <button
                                onClick={addPerk}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-2xl font-bold transition-all"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {perks.map((p, i) => (
                                <span key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">
                                    {p}
                                    <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removePerk(i)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-8 border-t border-slate-50 flex justify-end">
                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish Job Opening'}
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostJobPage;
