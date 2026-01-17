'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Search, Briefcase } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const StudentApplicationsPage = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'users', user.uid, 'applications'));
                const snapshot = await getDocs(q);
                setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    const filteredApps = applications.filter(app =>
        app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
                <p className="text-slate-500 mt-1">Track the status of your job and internship applications.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by job title or company..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-slate-100">
                            {searchTerm ? 'No applications match your search.' : 'You haven\'t applied to any jobs yet.'}
                            {!searchTerm && (
                                <Link href="/jobs" className="block mt-4 text-indigo-600 font-bold hover:underline">
                                    Browse Jobs
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredApps.map((app) => (
                            <div key={app.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400 overflow-hidden p-2">
                                        {app.logo ? (
                                            <img src={app.logo} alt={app.company} className="w-full h-full object-contain" />
                                        ) : (
                                            app.company?.charAt(0) || <Briefcase size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{app.title}</h3>
                                        <p className="text-sm text-slate-500">{app.company} • Applied on {formatDate(app.appliedAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between">
                                    <div className="flex items-center gap-2">
                                        {app.status === 'Shortlisted' ? (
                                            <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <CheckCircle2 size={14} /> {app.status}
                                            </span>
                                        ) : app.status === 'Pending' ? (
                                            <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <Clock size={14} /> {app.status}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                                <XCircle size={14} /> {app.status}
                                            </span>
                                        )}
                                    </div>
                                    <Link href={`/jobs/${app.jobId}`} className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
};

export default StudentApplicationsPage;
