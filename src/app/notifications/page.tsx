'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Bell, CheckCircle2, Briefcase, Mail, Info } from 'lucide-react';

const NotificationsPage = () => {
    const { user } = useAuth();
    const notifications: any[] = []; // Empty for now, replaced mock data

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-14">
                <main className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                                <p className="text-slate-500 mt-1">Stay updated with the latest job openings and application status.</p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No new notifications</h3>
                            <p className="text-slate-500">We'll notify you when there are updates to your applications.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotificationsPage;
