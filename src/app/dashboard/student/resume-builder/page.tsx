'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Trash2,
    Download,
    Save,
    Layout,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import StandardTemplate from '@/components/resume-templates/StandardTemplate';
import ModernTemplate from '@/components/resume-templates/ModernTemplate';
import LivePreview from './LivePreview';

const INITIAL_RESUME_DATA = {
    personal: { name: '', email: '', phone: '', linkedin: '', github: '' },
    education: [{ school: '', degree: '', year: '', cgpa: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
    projects: [{ name: '', tech: '', description: '', link: '' }],
    skills: [''],
    customSections: [] as { id: string, title: string, content: string }[],
};

const AIResumeBuilder = () => {
    const { user } = useAuth();
    const [phase, setPhase] = useState<'select' | 'build'>('select');
    const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'modern'>('standard');
    const [resumeData, setResumeData] = useState({
        ...INITIAL_RESUME_DATA,
        personal: { ...INITIAL_RESUME_DATA.personal, name: user?.name || '', email: user?.email || '' }
    });

    const [optimizing, setOptimizing] = useState<number | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const searchParams = useSearchParams();
    const resumeIdParam = searchParams.get('id');
    const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);

    // Load existing resume
    useEffect(() => {
        const loadResume = async () => {
            if (!user || !resumeIdParam) return;
            try {
                const docRef = doc(db, 'students', user.uid, 'savedResumes', resumeIdParam);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setResumeData({
                        ...INITIAL_RESUME_DATA,
                        ...data,
                        personal: { ...INITIAL_RESUME_DATA.personal, ...(data.personal || {}) },
                        education: data.education || INITIAL_RESUME_DATA.education,
                        experience: data.experience || INITIAL_RESUME_DATA.experience,
                        projects: data.projects || INITIAL_RESUME_DATA.projects,
                        skills: data.skills || INITIAL_RESUME_DATA.skills,
                        customSections: data.customSections || INITIAL_RESUME_DATA.customSections,
                    });
                    setSelectedTemplate(data.template || 'standard');
                    setPhase('build');
                }
            } catch (error) {
                console.error("Error loading resume:", error);
            }
        };
        loadResume();
    }, [user, resumeIdParam]);

    // Auto-save
    useEffect(() => {
        if (!user || phase !== 'build') return;
        const saveData = async () => {
            setIsSaving(true);
            try {
                const dataToSave = { ...resumeData, template: selectedTemplate, lastUpdated: new Date() };
                if (resumeId) {
                    await updateDoc(doc(db, 'students', user.uid, 'savedResumes', resumeId), dataToSave);
                } else {
                    const docRef = await addDoc(collection(db, 'students', user.uid, 'savedResumes'), {
                        ...dataToSave,
                        createdAt: new Date(),
                        name: resumeData.personal.name ? `${resumeData.personal.name}'s Resume` : 'Untitled Resume'
                    });
                    setResumeId(docRef.id);
                    window.history.replaceState(null, '', `?id=${docRef.id}`);
                }
                setLastSaved(new Date());
            } catch (error) {
                console.error("Auto-save error:", error);
            } finally {
                setIsSaving(false);
            }
        };
        const timeout = setTimeout(saveData, 3000);
        return () => clearTimeout(timeout);
    }, [resumeData, selectedTemplate, user, resumeId, phase]);

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResumeData({ ...resumeData, personal: { ...resumeData.personal, [e.target.name]: e.target.value } });
    };

    const handleListItemChange = (field: 'education' | 'experience' | 'projects', index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newList = [...resumeData[field]] as any;
        newList[index][e.target.name] = e.target.value;
        setResumeData({ ...resumeData, [field]: newList });
    };

    const addListItem = (field: 'education' | 'experience' | 'projects') => {
        const newItem = field === 'education' ? { school: '', degree: '', year: '', cgpa: '' } :
            field === 'experience' ? { company: '', role: '', duration: '', description: '' } :
                { name: '', tech: '', description: '', link: '' };
        setResumeData({ ...resumeData, [field]: [...resumeData[field], newItem] });
    };

    const removeListItem = (field: 'education' | 'experience' | 'projects', index: number) => {
        const newList = [...resumeData[field]];
        newList.splice(index, 1);
        setResumeData({ ...resumeData, [field]: newList });
    };

    const addCustomSection = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setResumeData({
            ...resumeData,
            customSections: [...resumeData.customSections, { id, title: 'New Section', content: '' }]
        });
    };

    const handleCustomSectionChange = (id: string, field: 'title' | 'content', value: string) => {
        const newSections = (resumeData.customSections || []).map(s =>
            s.id === id ? { ...s, [field]: value } : s
        );
        setResumeData({ ...resumeData, customSections: newSections });
    };

    const removeCustomSection = (id: string) => {
        setResumeData({
            ...resumeData,
            customSections: (resumeData.customSections || []).filter(s => s.id !== id)
        });
    };

    if (phase === 'select') {
        return (
            <div className="min-h-screen mesh-gradient pt-20">
                <Navbar />
                <div className="max-w-4xl mx-auto p-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <h1 className="text-5xl font-black text-slate-900 mb-4">Select a <span className="text-indigo-600">Template</span></h1>
                        <p className="text-xl text-slate-500">Choose the perfect design to showcase your story.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {['standard', 'modern'].map((t) => (
                            <motion.div
                                key={t}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedTemplate(t as 'standard' | 'modern')}
                                className={`cursor-pointer group relative p-6 rounded-[40px] border-4 transition-all ${selectedTemplate === t ? 'border-indigo-600 bg-white ring-8 ring-indigo-50' : 'border-white bg-white/50 hover:border-indigo-100 hover:bg-white'}`}
                            >
                                <div className="aspect-[1/1.4] bg-slate-50 rounded-3xl border border-slate-100 mb-6 overflow-hidden relative shadow-inner">
                                    <div className="p-4 space-y-3 opacity-40">
                                        <div className="h-4 w-1/2 bg-slate-300 rounded" />
                                        <div className="h-2 w-full bg-slate-300 rounded" />
                                        <div className="h-2 w-full bg-slate-300 rounded" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent flex items-end justify-center pb-8">
                                        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full border border-slate-100 shadow-sm font-black uppercase text-indigo-600 tracking-widest text-sm">
                                            {t} Layout
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-slate-900 capitalize mb-1">{t}</h3>
                                    <p className="text-slate-500 font-medium">
                                        {t === 'standard' ? 'Traditional LaTeX-style layout.' : 'Modern two-column tech layout.'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-16">
                        <button
                            onClick={() => setPhase('build')}
                            className="bg-slate-900 text-white px-12 py-5 rounded-[32px] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-3 hover:scale-105"
                        >
                            Architect My Resume <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col pt-16 overflow-hidden">
            <Navbar />

            {/* Minimal Header */}
            <div className="bg-white border-b border-slate-100 px-8 py-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setPhase('select')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-tight">Architect Studio</h1>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                            <Layout size={12} className="text-indigo-600" /> {selectedTemplate} Template
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">Status</p>
                        <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {isSaving ? 'Saving...' : 'Synced'}
                        </p>
                    </div>
                    <PDFDownloadLink
                        document={selectedTemplate === 'standard' ? <StandardTemplate data={resumeData} /> : <ModernTemplate data={resumeData} />}
                        fileName={`${resumeData.personal.name || 'Resume'}.pdf`}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                    >
                        {({ loading }) => (
                            <>
                                <Download size={18} />
                                {loading ? 'Preparing...' : 'Export PDF'}
                            </>
                        )}
                    </PDFDownloadLink>
                </div>
            </div>

            {/* Split Layout Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Input Form */}
                <div className="w-full lg:w-1/2 overflow-y-auto p-8 lg:p-12 space-y-12 custom-scrollbar bg-[#fcfdfe]">
                    {/* Sections */}
                    <div className="space-y-10 max-w-2xl mx-auto">
                        {/* Personal Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">01</div>
                                <h2 className="text-2xl font-black text-slate-900">Personal Details</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['name', 'email', 'phone', 'linkedin', 'github'].map((f) => (
                                    <div key={f} className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{f}</label>
                                        <input
                                            type="text"
                                            name={f}
                                            value={(resumeData.personal as any)[f]}
                                            onChange={handlePersonalInfoChange}
                                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-medium"
                                            placeholder={`Your ${f}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">02</div>
                                    <h2 className="text-2xl font-black text-slate-900">Education</h2>
                                </div>
                                <button onClick={() => addListItem('education')} className="p-2 bg-white border border-slate-100 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {resumeData.education.map((edu, i) => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="p-6 bg-white border border-slate-50 rounded-3xl shadow-sm relative group">
                                        {i > 0 && <button onClick={() => removeListItem('education', i)} className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 invisible group-hover:visible shadow-sm"><Trash2 size={14} /></button>}
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" name="school" placeholder="University/School" value={edu.school} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-100 outline-none w-full text-sm font-bold" />
                                            <input type="text" name="degree" placeholder="Degree (B.Tech, MS)" value={edu.degree} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-100 outline-none w-full text-sm font-bold" />
                                            <input type="text" name="year" placeholder="Year (2020 - 2024)" value={edu.year} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-100 outline-none w-full text-sm font-bold" />
                                            <input type="text" name="cgpa" placeholder="CGPA/Grade" value={edu.cgpa} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-100 outline-none w-full text-sm font-bold" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">03</div>
                                    <h2 className="text-2xl font-black text-slate-900">Experience</h2>
                                </div>
                                <button onClick={() => addListItem('experience')} className="p-2 bg-white border border-slate-100 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {resumeData.experience.map((exp, i) => (
                                    <div key={i} className="p-6 bg-white border border-slate-50 rounded-3xl shadow-sm relative group space-y-4">
                                        <button onClick={() => removeListItem('experience', i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 invisible group-hover:visible"><Trash2 size={18} /></button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" name="company" placeholder="Company Name" value={exp.company} onChange={(e) => handleListItemChange('experience', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none w-full text-sm font-black" />
                                            <input type="text" name="duration" placeholder="Duration (June 23 - Present)" value={exp.duration} onChange={(e) => handleListItemChange('experience', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none w-full text-sm font-black" />
                                        </div>
                                        <input type="text" name="role" placeholder="Your Role (Web Dev Intern)" value={exp.role} onChange={(e) => handleListItemChange('experience', i, e)} className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none text-sm font-bold" />
                                        <textarea
                                            name="description"
                                            rows={3}
                                            placeholder="Impactful description of your achievements..."
                                            value={exp.description}
                                            onChange={(e) => handleListItemChange('experience', i, e)}
                                            className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none resize-none text-sm leading-relaxed"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Projects */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">04</div>
                                    <h2 className="text-2xl font-black text-slate-900">Projects</h2>
                                </div>
                                <button onClick={() => addListItem('projects')} className="p-2 bg-white border border-slate-100 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="space-y-6">
                                {resumeData.projects.map((proj, i) => (
                                    <div key={i} className="p-6 bg-white border border-slate-50 rounded-3xl shadow-sm relative group space-y-4">
                                        <button onClick={() => removeListItem('projects', i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 invisible group-hover:visible"><Trash2 size={18} /></button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" name="name" placeholder="Project Title" value={proj.name} onChange={(e) => handleListItemChange('projects', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none w-full text-sm font-black" />
                                            <input type="text" name="tech" placeholder="Tech Used (React, Node)" value={proj.tech} onChange={(e) => handleListItemChange('projects', i, e)} className="p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none w-full text-sm font-black" />
                                        </div>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            placeholder="What did this project solve?"
                                            value={proj.description}
                                            onChange={(e) => handleListItemChange('projects', i, e)}
                                            className="w-full p-4 bg-slate-50 rounded-xl border-transparent focus:bg-white outline-none resize-none text-sm leading-relaxed"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">05</div>
                                <h2 className="text-2xl font-black text-slate-900">Expertise</h2>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-widest">Skill Tags (Comma separated)</label>
                                <textarea
                                    rows={4}
                                    placeholder="JavaScript, React, Tailwind, Python, Machine Learning..."
                                    value={resumeData.skills.join(', ')}
                                    onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                    className="w-full p-6 bg-white rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-slate-600"
                                />
                            </div>
                        </section>

                        {/* Custom Sections */}
                        {(resumeData.customSections || []).map((section, i) => (
                            <section key={section.id} className="space-y-6">
                                <div className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">{String(i + 6).padStart(2, '0')}</div>
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => handleCustomSectionChange(section.id, 'title', e.target.value)}
                                            className="text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 w-fit cursor-edit p-0"
                                            placeholder="Section Title..."
                                        />
                                    </div>
                                    <button onClick={() => removeCustomSection(section.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder={`Details for ${section.title}...`}
                                    value={section.content}
                                    onChange={(e) => handleCustomSectionChange(section.id, 'content', e.target.value)}
                                    className="w-full p-6 bg-white rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm font-bold text-slate-600"
                                />
                            </section>
                        ))}

                        {/* Add Section Button */}
                        <div className="pb-20">
                            <button
                                onClick={addCustomSection}
                                className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[40px] text-slate-400 font-black flex flex-col items-center justify-center gap-2 hover:border-indigo-100 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span>Add New Custom Section</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-60">Awards, Certifications, Languages...</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Preview (Sticky/Fixed) */}
                <div className="hidden lg:flex w-1/2 bg-[#0a0c10] items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]" />
                    <div className="relative w-full h-[85vh] max-w-[600px] group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative h-full bg-white rounded-2xl shadow-2xl overflow-hidden scale-[0.9] transform-gpu origin-top">
                            <LivePreview data={resumeData} template={selectedTemplate} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIResumeBuilder;
