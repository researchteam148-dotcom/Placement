'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Download, ExternalLink, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const RecruiterApplicantsPage = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('all');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Jobs posted by this recruiter (or all if admin) to populate filter
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                let q;
                if (user.role === 'admin') {
                    q = query(collection(db, 'jobs'), where('type', '==', 'On-Campus'));
                } else {
                    q = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
                }
                const snapshot = await getDocs(q);
                const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJobs(jobsData);

                // Set default selection if jobs exist
                if (jobsData.length > 0) {
                    setSelectedJobId(jobsData[0].id);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };
        fetchJobs();
    }, [user]);

    // 2. Fetch Applications for the selected job
    useEffect(() => {
        const fetchApplications = async () => {
            if (!selectedJobId || selectedJobId === 'all') {
                setApplications([]); // For now, simple implementation: select a job to see apps
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const appsRef = collection(db, 'jobs', selectedJobId, 'applications');
                const snapshot = await getDocs(appsRef);
                setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [selectedJobId]);

    const handleUpdateStatus = async (appId: string, applicantId: string, newStatus: string) => {
        if (!selectedJobId) return;
        try {
            // 1. Update in Job's subcollection
            const jobAppRef = doc(db, 'jobs', selectedJobId, 'applications', applicantId); // applicantId is docId in this subcol
            await updateDoc(jobAppRef, { status: newStatus });

            // 2. Update in User's subcollection (Sync)
            const userAppRef = doc(db, 'users', applicantId, 'applications', selectedJobId);
            await updateDoc(userAppRef, { status: newStatus });

            // Update local state
            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Applicants</h1>
                    <p className="text-slate-500 mt-1">Review student applications and update selection statuses.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex mb-8 gap-4 flex-col md:flex-row">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all" disabled>Select a Job Role</option>
                        {jobs.map(job => (
                            <option key={job.id} value={job.id}>{job.title} ({job.company})</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            {selectedJobId === 'all' ? "Please select a job to view applicants." : "No applications received yet for this role."}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Applied On</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs uppercase">
                                                    {(app.applicantName || 'U').charAt(0)}
                                                </div>
                                                <div className="font-bold text-slate-900">{app.applicantName || 'Unknown User'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 text-sm">{app.applicantEmail}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                                                    app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(app.id, app.applicantId, 'Shortlisted')}
                                                    title="Shortlist"
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(app.id, app.applicantId, 'Rejected')}
                                                    title="Reject"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button title="View Profile (Coming Soon)" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterApplicantsPage;
