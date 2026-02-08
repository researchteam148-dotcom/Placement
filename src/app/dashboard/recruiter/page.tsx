'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Users,
    Briefcase,
    Plus,
    PieChart,
    UserCheck,
    Search,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        interviews: 0
    });
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // Fetch Jobs posted by this recruiter
                const q = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedJobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Calculate Stats
                // Note: accurate applicant counts require fetching subcollections or maintaining counters. 
                // For now, we will assume 0 if not tracked, or sum up if we had the data.
                // To keep it performant, we won't fetch *all* application subcollections here.

                setJobs(fetchedJobs);
                setStats({
                    activeJobs: fetchedJobs.length,
                    totalApplicants: 0, // Placeholder until aggregation is implemented
                    shortlisted: 0,
                    interviews: 0
                });

            } catch (error) {
                console.error("Error fetching recruiter dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const statCards = [
        { label: 'Active Jobs', value: stats.activeJobs, icon: <Briefcase className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Total Applicants', value: stats.totalApplicants, icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Shortlisted', value: stats.shortlisted, icon: <UserCheck className="text-emerald-600" />, color: 'bg-emerald-50' },
        { label: 'Interviews', value: stats.interviews, icon: <PieChart className="text-amber-600" />, color: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Employer Center</h1>
                    <p className="text-slate-500 mt-1">Manage your active postings and review top talent.</p>
                </div>
                <Link
                    href="/dashboard/recruiter/post-job"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Post New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                    >
                        <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Active Postings</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Job Title</th>
                                    <th className="px-6 py-4">Applied</th>
                                    <th className="px-6 py-4">Deadline</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">Loading jobs...</td>
                                    </tr>
                                ) : jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No active jobs found.</td>
                                    </tr>
                                ) : (
                                    jobs.map((job, i) => (
                                        <tr key={job.id || i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{job.title}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {/* Placeholder for applicant count */}
                                                -
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{job.deadline || 'No deadline'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                    job.status === 'Closed' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'
                                                    }`}>
                                                    {job.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Recent Applicants</h2>
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm">
                        <div className="text-center text-slate-500 text-sm py-4">
                            Select a job to view applicants.
                        </div>

                        <Link
                            href="/dashboard/recruiter/applicants"
                            className="block text-center text-sm font-bold text-indigo-600 hover:underline pt-2"
                        >
                            View All Candidates
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
