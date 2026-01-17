'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, ExternalLink, Trash2, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { collection, deleteDoc, doc, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AdminJobsPage = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Real-time listener for jobs - Filter only On-Campus jobs for Admin
        const q = query(
            collection(db, 'jobs'),
            where('type', '==', 'On-Campus')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setJobs(jobsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (jobId: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            try {
                await deleteDoc(doc(db, 'jobs', jobId));
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("Failed to delete job");
            }
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage All Jobs</h1>
                    <p className="text-slate-500 mt-1">Global view of on-campus and off-campus opportunities.</p>
                </div>
                <Link
                    href="/dashboard/recruiter/post-job"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Add Job Listing
                </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search jobs by title or company..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No jobs found.
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{job.title}</h3>
                                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs text-slate-500 mt-1 items-center">
                                            <span className="font-semibold flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${job.type === 'On-Campus' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {job.type || 'Off-Campus'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-bold text-slate-900">{job.applicants || 0}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Applicants</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/jobs/${job.id}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><ExternalLink size={20} /></Link>
                                        <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminJobsPage;
