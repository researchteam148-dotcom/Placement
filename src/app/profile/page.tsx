'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    User,
    Mail,
    GraduationCap,
    BookOpen,
    FileText,
    Save,
    Plus,
    Trash2,
    Loader2,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    Check
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState(['React', 'Node.js', 'Python', 'System Design']);
    const [newSkill, setNewSkill] = useState('');

    React.useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    setSkills(data.skills || []);
                }
            }
        };
        fetchStudentData();
    }, [user]);


    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };

    return (
        <div className="min-h-screen mesh-gradient overflow-x-hidden">
            <Navbar />
            <div className="pt-20 pb-20 px-6">
                <main className="max-w-7xl mx-auto">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col md:flex-row justify-between items-center sm:items-end gap-6"
                        >
                            <div className="text-center sm:text-left">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Personal <span className="text-indigo-600">Identity</span></h1>
                                <p className="text-lg text-slate-500 mt-2 font-medium">Manage your professional presence and academic credentials.</p>
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95">
                                <Save size={20} />
                                Save Changes
                            </button>
                        </motion.div>

                        <div className="grid md:grid-cols-12 gap-12">
                            {/* Profile Card */}
                            <div className="md:col-span-4 space-y-8">
                                <div className="glass-card p-10 text-center shadow-xl shadow-indigo-100/20 rounded-[40px] relative overflow-hidden group">
                                    <div className="w-28 h-28 bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-[32px] mx-auto mb-6 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{user?.name}</h2>
                                    <p className="text-sm text-slate-500 mb-8 font-medium">{user?.email}</p>

                                    <div className="bg-slate-900 text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-[0.2em] shadow-lg">
                                        {user?.role} Account
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
                                </div>

                            </div>

                            {/* Details Form */}
                            <div className="md:col-span-8 space-y-12">
                                <div className="glass-card p-10 rounded-[40px] space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Academic Record</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Verified educational credentials</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current CGPA</label>
                                            <input type="text" defaultValue="9.24" className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Branch</label>
                                            <select className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black appearance-none">
                                                <option>Computer Science</option>
                                                <option>Information Tech</option>
                                                <option>Electronics</option>
                                                <option>Mechanical</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Graduation Year</label>
                                            <input type="text" defaultValue="2026" className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Batch</label>
                                            <input type="text" defaultValue="2022-26" className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black" />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-10 rounded-[40px] space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expertise Graph</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Highlighted skills and capabilities</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1 group">
                                            <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                placeholder="Inject new skill (e.g. Kubernetes)"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50/50 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            />
                                        </div>
                                        <button onClick={addSkill} className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95">
                                            Add
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <AnimatePresence>
                                            {skills.map((skill, i) => (
                                                <motion.span
                                                    key={skill}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition-all group shadow-sm"
                                                >
                                                    {skill}
                                                    <Trash2
                                                        size={14}
                                                        className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                                                        onClick={() => setSkills(skills.filter(s => s !== skill))}
                                                    />
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
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

export default ProfilePage;
