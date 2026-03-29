'use client';

import React, { useState, useEffect } from 'react';
import { Search, Mail, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';

const AdminStudentsPage = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'student'));
                const snapshot = await getDocs(q);
                const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Fetched students:", studentsData);
                setStudents(studentsData);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Students</h1>
                    <p className="text-slate-500 mt-1">Review and manage all student profiles across departments.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center p-20 space-y-4">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Syncing Students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-20 px-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                <Search className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">No Students Found</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">We couldn't find any students matching your search criteria. Try a different name or email.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Joined On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs overflow-hidden">
                                                    {student.photoURL ? (
                                                        <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (student.name || 'U').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{student.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">Student</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">{student.email}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {formatDate(student.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3 items-center">
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Email Student">
                                                    <Mail size={18} />
                                                </button>
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Verify Account">
                                                    <ShieldCheck size={18} />
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

export default AdminStudentsPage;
