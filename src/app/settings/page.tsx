'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Settings, User, Bell, Shield, Lock, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-14">
                <main className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                            <p className="text-slate-500 mt-1">Manage your account preferences and security settings.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8">
                            <aside className="space-y-2">
                                {[
                                    { name: 'Profile', icon: <User size={18} />, active: true },
                                    { name: 'Notifications', icon: <Bell size={18} /> },
                                    { name: 'Security', icon: <Shield size={18} /> },
                                    { name: 'Password', icon: <Lock size={18} /> },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-100'
                                            }`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </button>
                                ))}
                            </aside>

                            <div className="md:col-span-3 space-y-8">
                                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <User size={20} className="text-indigo-600" /> Personal Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                                <input type="text" defaultValue={user?.name || ''} className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                                <input type="email" defaultValue={user?.email || ''} disabled className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 opacity-60 cursor-not-allowed" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-8 border-t border-slate-50">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <Bell size={20} className="text-indigo-600" /> Notifications
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                'Email alerts for new job postings',
                                                'Push notifications for application status updates',
                                                'Weekly placement summary reports',
                                            ].map((text, i) => (
                                                <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                                    <span className="text-sm font-bold text-slate-700">{text}</span>
                                                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 shadow-inner">
                                                        <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
                                            <Save size={20} />
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
