'use client';

import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, User, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const AdminRecruitersPage = () => {
    const { user } = useAuth();
    const [recruiters, setRecruiters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecruiters = async () => {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'recruiter'));
            const snapshot = await getDocs(q);
            setRecruiters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching recruiters:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const handleUpdateStatus = async (recruiterId: string, newStatus: 'Approved' | 'Rejected') => {
        try {
            await updateDoc(doc(db, 'users', recruiterId), {
                status: newStatus
            });

            alert(`Recruiter ${newStatus.toLowerCase()} successfully!`);
            fetchRecruiters(); // Refresh list
        } catch (error) {
            console.error('Error updating recruiter status:', error);
            alert('Failed to update recruiter status');
        }
    };

    const handleDeleteRecruiter = async (recruiterId: string, recruiterName: string) => {
        if (!confirm(`Are you sure you want to delete ${recruiterName}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', recruiterId));
            alert('Recruiter deleted successfully!');
            fetchRecruiters(); // Refresh list
        } catch (error) {
            console.error('Error deleting recruiter:', error);
            alert('Failed to delete recruiter');
        }
    };

    return (
        <div className="space-y-8 relative">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Manage Recruiters</h1>
                <p className="text-slate-500 mt-1">Review and approve recruiter registrations. Recruiters can self-register and await your approval.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : recruiters.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100">
                        No recruiters found. Recruiters can register at /auth/register.
                    </div>
                ) : (
                    recruiters.map((recruiter) => (
                        <div key={recruiter.id} className={`bg-white border-2 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${recruiter.status === 'Pending' ? 'border-amber-200 bg-amber-50/30' :
                            recruiter.status === 'Rejected' ? 'border-red-200 bg-red-50/30' :
                                'border-slate-100'
                            }`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden">
                                    {recruiter.photoURL ? (
                                        <img src={recruiter.photoURL} alt={recruiter.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${recruiter.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                    recruiter.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {recruiter.status || 'Approved'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {recruiter.companyName || recruiter.name}
                            </h3>
                            {recruiter.companyName && (
                                <p className="text-sm font-medium text-indigo-600 mb-1">
                                    Contact: {recruiter.name}
                                </p>
                            )}
                            <p className="text-sm text-slate-500 mb-2">{recruiter.email}</p>
                            {recruiter.industry && (
                                <p className="text-xs text-slate-400 mb-4">Industry: {recruiter.industry}</p>
                            )}

                            {recruiter.status === 'Pending' && (
                                <div className="flex gap-2 pt-4 border-t border-slate-200">
                                    <button
                                        onClick={() => handleUpdateStatus(recruiter.id, 'Approved')}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(recruiter.id, 'Rejected')}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            )}

                            {/* Delete button for all recruiters */}
                            <div className="pt-4 border-t border-slate-200 mt-4">
                                <button
                                    onClick={() => handleDeleteRecruiter(recruiter.id, recruiter.companyName || recruiter.name)}
                                    className="w-full bg-slate-100 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete Recruiter
                                </button>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    );
};

export default AdminRecruitersPage;
