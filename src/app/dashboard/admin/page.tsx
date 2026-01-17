'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart3,
    Users,
    Building2,
    Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getCountFromServer, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        recruiters: 0,
        jobs: 0,
        applications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch counts using aggregation queries (cost-efficient)
                const studentsColl = collection(db, 'users');
                const qStudents = query(studentsColl, where('role', '==', 'student'));
                const studentSnapshot = await getCountFromServer(qStudents);

                const recruitersColl = collection(db, 'users');
                const qRecruiters = query(recruitersColl, where('role', '==', 'recruiter'));
                const recruiterSnapshot = await getCountFromServer(qRecruiters);

                const jobsColl = collection(db, 'jobs');
                const jobSnapshot = await getCountFromServer(jobsColl);

                setStats({
                    students: studentSnapshot.data().count,
                    recruiters: recruiterSnapshot.data().count,
                    jobs: jobSnapshot.data().count,
                    applications: 0 // Placeholder or fetch if needed (expensive to count subcollections globally without a counter)
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Students', value: loading ? '...' : stats.students, icon: <Users className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Partner Recruiters', value: loading ? '...' : stats.recruiters, icon: <Building2 className="text-indigo-600" />, color: 'bg-indigo-50' },
        { label: 'Active Jobs', value: loading ? '...' : stats.jobs, icon: <Briefcase className="text-emerald-600" />, color: 'bg-emerald-50' },
        { label: 'Avg. Package', value: 'N/A', icon: <BarChart3 className="text-amber-600" />, color: 'bg-amber-50' }, // Placeholder for now
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Coordination Hub</h1>
                    <p className="text-slate-500 mt-1">Global oversight and placement policy management.</p>
                </div>
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

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">System Activity</h2>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-8 text-center text-slate-500">
                        <p>Real-time activity feed coming soon.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Placement Trends</h2>
                    <div className="bg-white border border-slate-100 p-8 rounded-2xl flex items-center justify-center shadow-sm h-[320px]">
                        <div className="text-center">
                            <BarChart3 size={48} className="text-slate-200 mx-auto mb-4" />
                            <div className="text-slate-400 font-medium">Chart visualization requires historical data.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
