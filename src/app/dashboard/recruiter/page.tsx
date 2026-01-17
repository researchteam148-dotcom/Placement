'use client';

import React from 'react';
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

const RecruiterDashboard = () => {
    const { user } = useAuth();

    const stats = [
        { label: 'Active Jobs', value: '5', icon: <Briefcase className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Total Applicants', value: '428', icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Shortlisted', value: '32', icon: <UserCheck className="text-emerald-600" />, color: 'bg-emerald-50' },
        { label: 'Interviews', value: '18', icon: <PieChart className="text-amber-600" />, color: 'bg-amber-50' },
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
                {stats.map((stat, i) => (
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
                                {[
                                    { title: 'Software Dev', applied: 142, deadline: '24 Feb', status: 'Active' },
                                    { title: 'UI Designer', applied: 89, deadline: '28 Feb', status: 'Reviewing' },
                                    { title: 'Project Lead', applied: 34, deadline: '15 Mar', status: 'Paused' },
                                ].map((job, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{job.title}</td>
                                        <td className="px-6 py-4 text-slate-600">{job.applied} candidates</td>
                                        <td className="px-6 py-4 text-slate-600">{job.deadline}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                job.status === 'Reviewing' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Recent Applicants</h2>
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-sm">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                    JD
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-900">Jane Doe</div>
                                    <div className="text-xs text-slate-500">B.Tech CS • 9.2 CGPA</div>
                                </div>
                                <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                    <ExternalLink size={14} className="text-slate-400" />
                                </button>
                            </div>
                        ))}
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
