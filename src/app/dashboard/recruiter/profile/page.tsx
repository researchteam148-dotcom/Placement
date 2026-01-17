'use client';

import React from 'react';
import { Building2, Mail, Globe, MapPin, Save, Plus, Trash2 } from 'lucide-react';

const RecruiterProfilePage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
                    <p className="text-slate-500 mt-1">Manage public details and recruitment team settings.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100">
                    <Save size={20} />
                    Save Changes
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl mx-auto mb-4 flex items-center justify-center text-slate-300">
                            <Building2 size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Google Inc.</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Verified Employer</p>
                        <div className="flex justify-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Globe size={18} /></div>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Mail size={18} /></div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Building2 size={20} className="text-indigo-600" /> Basic Details
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                                <input type="text" defaultValue="Google Inc." className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                                        <input type="text" defaultValue="Tech / Cloud" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Website</label>
                                        <input type="text" defaultValue="https://google.com" className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Headquarters</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="text" defaultValue="Mountain View, CA" className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Plus size={20} className="text-indigo-600" /> Recruitment Policy
                        </h3>
                        <textarea
                            rows={4}
                            defaultValue="We prioritize innovation and diversity. Candidates with strong foundations in CS fundamentals and proof of projects are encouraged to apply."
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfilePage;
