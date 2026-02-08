'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div key={app.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg uppercase">
                                                {(app.applicantName || 'U').charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg">{app.applicantName || 'Unknown User'}</h3>
                                                <p className="text-sm text-slate-500 font-medium">{app.applicantEmail}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1">Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                                                app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Student Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-2xl">
                                        {app.branch && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Branch</p>
                                                <p className="text-sm font-bold text-slate-900">{app.branch}</p>
                                            </div>
                                        )}
                                        {app.cgpa && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">CGPA</p>
                                                <p className="text-sm font-bold text-slate-900">{app.cgpa}</p>
                                            </div>
                                        )}
                                        {app.backlogs !== undefined && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Backlogs</p>
                                                <p className={`text-sm font-bold ${app.backlogs === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {app.backlogs}
                                                </p>
                                            </div>
                                        )}
                                        {app.gradYear && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Grad Year</p>
                                                <p className="text-sm font-bold text-slate-900">{app.gradYear}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills */}
                                    {app.skills && app.skills.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {app.skills.map((skill: string, idx: number) => (
                                                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex gap-2">
                                            {app.resumeUrl && (
                                                <a
                                                    href={app.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                                >
                                                    <FileText size={16} />
                                                    View Resume
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(app.id, app.applicantId, 'Shortlisted')}
                                                title="Shortlist"
                                                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={18} />
                                                Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app.id, app.applicantId, 'Rejected')}
                                                title="Reject"
                                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm flex items-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterApplicantsPage;
