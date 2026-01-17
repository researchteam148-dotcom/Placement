'use client';

import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, ExternalLink, User, Plus, X, Lock } from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AdminRecruitersPage = () => {
    const [recruiters, setRecruiters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRecruiter, setNewRecruiter] = useState({
        name: '',
        email: '',
        industry: '',
        tempPassword: ''
    });

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

    const handleAddRecruiter = async () => {
        if (!newRecruiter.name || !newRecruiter.email || !newRecruiter.industry) {
            alert('Please fill in all fields');
            return;
        }

        const tempPass = Math.random().toString(36).slice(-8); // Generate random temp password

        try {
            await addDoc(collection(db, 'users'), {
                name: newRecruiter.name,
                email: newRecruiter.email,
                role: 'recruiter',
                industry: newRecruiter.industry,
                tempPassword: tempPass, // In a real app, send this via email. Storing plainly for MVP demo.
                createdAt: new Date().toISOString(),
                status: 'Approved' // Auto-approve admin added recruiters
            });

            // IMPORTANT: Since we don't have Admin SDK to create Auth users directly from client,
            // we instruct the admin to ask the recruiter to sign up.
            alert(`Recruiter Added to Database!\n\nPlease ask the recruiter to SIGN UP on the portal using this email: ${newRecruiter.email}.\n\nWhen they sign up, they will automatically get the 'Recruiter' role.`);
            setIsModalOpen(false);
            setNewRecruiter({ name: '', email: '', industry: '', tempPassword: '' });
            fetchRecruiters(); // Refresh list
        } catch (error) {
            console.error("Error adding recruiter:", error);
            alert("Failed to add recruiter");
        }
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Recruiters</h1>
                    <p className="text-slate-500 mt-1">Approve and manage partner companies and their recruitment agents.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} />
                    Add Recruiter
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : recruiters.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100">
                        No recruiters found. Add one to get started.
                    </div>
                ) : (
                    recruiters.map((recruiter) => (
                        <div key={recruiter.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden">
                                    {recruiter.photoURL ? (
                                        <img src={recruiter.photoURL} alt={recruiter.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                    Approved
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{recruiter.name}</h3>
                            <p className="text-sm text-slate-500 mb-6">{recruiter.email}</p>
                            {recruiter.tempPassword && (
                                <div className="mb-4 bg-amber-50 text-amber-800 text-xs p-2 rounded-lg break-all">
                                    <span className="font-bold block mb-1">Temp Pass:</span> {recruiter.tempPassword}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                <div className="text-sm font-bold text-slate-700">{recruiter.industry || 'Tech'}</div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><ExternalLink size={20} /></button>
                                </div>
                            </div>
                        </div>
                    )))}
            </div>

            {/* Add Recruiter Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Add New Recruiter</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={newRecruiter.name}
                                    onChange={(e) => setNewRecruiter({ ...newRecruiter, name: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Recruiter Email</label>
                                <input
                                    type="email"
                                    value={newRecruiter.email}
                                    onChange={(e) => setNewRecruiter({ ...newRecruiter, email: e.target.value })}
                                    placeholder="recruiter@acme.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                                <input
                                    type="text"
                                    value={newRecruiter.industry}
                                    onChange={(e) => setNewRecruiter({ ...newRecruiter, industry: e.target.value })}
                                    placeholder="e.g. Fintech"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleAddRecruiter}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                                >
                                    Create Account
                                </button>
                            </div>
                            <p className="text-xs text-center text-slate-400 mt-4">
                                A temporary password will be generated automatically.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRecruitersPage;
