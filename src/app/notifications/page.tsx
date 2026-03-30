'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle2, Briefcase, XCircle, Clock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
            setLoading(false);

            // Automatically mark unread notifications as read
            const unreadDocs = snapshot.docs.filter(doc => !doc.data().isRead);
            if (unreadDocs.length > 0) {
                const batch = writeBatch(db);
                unreadDocs.forEach(d => {
                    batch.update(doc(db, 'users', user.uid, 'notifications', d.id), { isRead: true });
                });
                batch.commit().catch(console.error);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const getIcon = (status: string) => {
        switch (status) {
            case 'Shortlisted': return <CheckCircle2 className="text-emerald-500" size={24} />;
            case 'Rejected': return <XCircle className="text-red-500" size={24} />;
            default: return <Briefcase className="text-indigo-500" size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-14">
                <main className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                                <p className="text-slate-500 mt-1">Stay updated with the latest job openings and application status.</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No new notifications</h3>
                                <p className="text-slate-500">We'll notify you when there are updates to your applications.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notif, index) => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white border ${!notif.isRead ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100'} rounded-2xl p-6 shadow-sm flex gap-4 items-start transition-all`}
                                    >
                                        <div className={`p-3 rounded-full ${!notif.isRead ? 'bg-indigo-100' : 'bg-slate-50'}`}>
                                            {getIcon(notif.status)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-slate-900 text-lg">
                                                    {notif.status === 'New Job Alert' ? 'New Job Alert 🚀' : 'Application Update'}
                                                </h3>
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {formatDate(notif.timestamp)}
                                                </span>
                                            </div>
                                            {notif.status === 'New Job Alert' ? (
                                                <p className="text-slate-600">
                                                    <span className="font-bold text-slate-800">{notif.company}</span> has just posted a new opening for <span className="font-bold text-slate-800">{notif.title}</span>. Apply now before the deadline!
                                                </p>
                                            ) : (
                                                <p className="text-slate-600">
                                                    Your application for <span className="font-bold text-slate-800">{notif.title}</span> at <span className="font-bold text-slate-800">{notif.company}</span> has been marked as <span className={`font-black uppercase tracking-wider text-xs px-2 py-0.5 rounded-md ${notif.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' : notif.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{notif.status}</span>.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotificationsPage;
