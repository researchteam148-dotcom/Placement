'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    GraduationCap,
    ChevronRight,
    ChevronLeft,
    Plus,
    Trash2,
    Sparkles,
    Download,
    Save,
    FileText,
    Layout,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import StandardTemplate from '@/components/resume-templates/StandardTemplate';
import ModernTemplate from '@/components/resume-templates/ModernTemplate';

const steps = ['Template', 'Basic Info', 'Education', 'Experience', 'Projects', 'Skills', 'Preview'];

const AIResumeBuilder = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'modern'>('standard');
    const [resumeData, setResumeData] = useState({
        personal: { name: user?.name || '', email: user?.email || '', phone: '', linkedin: '', github: '' },
        education: [{ school: '', degree: '', year: '', cgpa: '' }],
        experience: [{ company: '', role: '', duration: '', description: '' }],
        projects: [{ name: '', tech: '', description: '', link: '' }],
        skills: [''],
    });

    const [optimizing, setOptimizing] = useState<number | null>(null);
    const resumeRef = useRef<HTMLDivElement>(null);

    const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const searchParams = useSearchParams();
    const resumeIdParam = searchParams.get('id');
    const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load existing resume if ID is present
    useEffect(() => {
        const loadResume = async () => {
            if (!user || !resumeIdParam) return;
            try {
                const docRef = doc(db, 'students', user.uid, 'savedResumes', resumeIdParam);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setResumeData(docSnap.data() as any);
                    setSelectedTemplate(docSnap.data().template || 'standard');
                }
            } catch (error) {
                console.error("Error loading resume:", error);
            }
        };
        loadResume();
    }, [user, resumeIdParam]);

    // Auto-save logic
    useEffect(() => {
        if (!user) return;

        const saveData = async () => {
            setIsSaving(true);
            try {
                const dataToSave = {
                    ...resumeData,
                    template: selectedTemplate,
                    lastUpdated: new Date()
                };

                if (resumeId) {
                    await updateDoc(doc(db, 'students', user.uid, 'savedResumes', resumeId), dataToSave);
                } else {
                    const docRef = await addDoc(collection(db, 'students', user.uid, 'savedResumes'), {
                        ...dataToSave,
                        createdAt: new Date(),
                        name: resumeData.personal.name ? `${resumeData.personal.name}'s Resume` : 'Untitled Resume'
                    });
                    setResumeId(docRef.id);
                    // Update URL without reload to reflect new ID
                    window.history.replaceState(null, '', `?id=${docRef.id}`);
                }
                setLastSaved(new Date());
            } catch (error) {
                console.error("Auto-save error:", error);
            } finally {
                setIsSaving(false);
            }
        };

        const timeout = setTimeout(saveData, 3000); // Auto-save after 3 seconds of inactivity
        return () => clearTimeout(timeout);
    }, [resumeData, selectedTemplate, user, resumeId]);

    const saveResume = async () => {
        // Manual save is now just a visual confirmation or immediate trigger if needed, 
        // but auto-save handles the core logic. 
        // We can force a save here if needed.
        if (!user) return;
        setIsSaving(true);
        try {
            // Logic duplicated for immediate save feedback
            const dataToSave = {
                ...resumeData,
                template: selectedTemplate,
                lastUpdated: new Date()
            };
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
            alert('Saved successfully!');
        } catch (error) {
            console.error("Manual save error:", error);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptimize = async (type: 'experience' | 'projects', index: number) => {
        const text = type === 'experience' ? resumeData.experience[index].description : resumeData.projects[index].description;
        if (!text) return;

        setOptimizing(index);
        try {
            const optimized = await optimizeWithAI(type, text) as string;
            const newList = [...resumeData[type]] as any;
            newList[index].description = optimized;
            setResumeData({ ...resumeData, [type]: newList });
        } finally {
            setOptimizing(null);
        }
    };

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResumeData({
            ...resumeData,
            personal: { ...resumeData.personal, [e.target.name]: e.target.value }
        });
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

    const handleListItemChange = (field: 'education' | 'experience' | 'projects', index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newList = [...resumeData[field]] as any;
        newList[index][e.target.name] = e.target.value;
        setResumeData({ ...resumeData, [field]: newList });
    };

    const optimizeWithAI = async (field: string, text: string) => {
        // Simulated AI optimization
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Optimized ${field}: Strong focus on ${text.length > 20 ? 'strategic' : 'technical'} execution and measurable outcomes.`);
            }, 1000);
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">Choose Your Template</h3>
                            <p className="text-slate-500">Select a design that fits your professional style.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Standard Template Card */}
                            <div
                                onClick={() => setSelectedTemplate('standard')}
                                className={`cursor-pointer group p-4 rounded-3xl border-2 transition-all hover:scale-[1.02] ${selectedTemplate === 'standard' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-100' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                            >
                                <div className="aspect-[1/1.4] bg-white rounded-xl shadow-lg border border-slate-100 mb-4 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-slate-100 p-3 space-y-2 opacity-50">
                                        <div className="h-4 w-16 bg-slate-300 rounded mb-4 mx-auto"></div>
                                        <div className="space-y-1">
                                            <div className="h-2 w-full bg-slate-300 rounded"></div>
                                            <div className="h-2 w-2/3 bg-slate-300 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                                        <div className="text-center font-black text-slate-900">Standard</div>
                                        <div className="text-center text-xs text-slate-500">Classic styling for traditional industries.</div>
                                    </div>
                                </div>
                                <div className="flex justify-center transition-opacity opacity-0 group-hover:opacity-100">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTemplate === 'standard' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                        {selectedTemplate === 'standard' && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                            </div>

                            {/* Modern Template Card */}
                            <div
                                onClick={() => setSelectedTemplate('modern')}
                                className={`cursor-pointer group p-4 rounded-3xl border-2 transition-all hover:scale-[1.02] ${selectedTemplate === 'modern' ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-100' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                            >
                                <div className="aspect-[1/1.4] bg-white rounded-xl shadow-lg border border-slate-100 mb-4 overflow-hidden relative flex">
                                    <div className="w-1/3 bg-slate-50 h-full border-r border-slate-200"></div>
                                    <div className="w-2/3 h-full p-2">
                                        <div className="h-2 w-full bg-slate-200 rounded mb-1"></div>
                                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                                        <div className="text-center font-black text-slate-900">Modern</div>
                                        <div className="text-center text-xs text-slate-500">Two-column layout for tech & creative roles.</div>
                                    </div>
                                </div>
                                <div className="flex justify-center transition-opacity opacity-0 group-hover:opacity-100">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTemplate === 'modern' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                        {selectedTemplate === 'modern' && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {['name', 'email', 'phone', 'linkedin', 'github'].map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 capitalize">{field}</label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={(resumeData.personal as any)[field]}
                                        onChange={handlePersonalInfoChange}
                                        className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Education</h3>
                            <button onClick={() => addListItem('education')} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                                <Plus size={16} /> Add More
                            </button>
                        </div>
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-2xl relative group">
                                {i > 0 && (
                                    <button onClick={() => removeListItem('education', i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="school" placeholder="University/School" value={edu.school} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                    <input type="text" name="degree" placeholder="Degree (e.g. B.Tech CSE)" value={edu.degree} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                    <input type="text" name="year" placeholder="Year" value={edu.year} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                    <input type="text" name="cgpa" placeholder="CGPA" value={edu.cgpa} onChange={(e) => handleListItemChange('education', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Experience</h3>
                            <button onClick={() => addListItem('experience')} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                                <Plus size={16} /> Add More
                            </button>
                        </div>
                        {resumeData.experience.map((exp, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-2xl relative group space-y-4">
                                <button onClick={() => removeListItem('experience', i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="company" placeholder="Company Name" value={exp.company} onChange={(e) => handleListItemChange('experience', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                    <input type="text" name="role" placeholder="Role (e.g. Web Dev Intern)" value={exp.role} onChange={(e) => handleListItemChange('experience', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-indigo-500 outline-none w-full" />
                                </div>
                                <div className="space-y-2">
                                    <textarea
                                        name="description"
                                        rows={3}
                                        placeholder="Briefly describe your responsibilities..."
                                        value={exp.description}
                                        onChange={(e) => handleListItemChange('experience', i, e)}
                                        className="w-full p-4 bg-white rounded-xl border-transparent focus:border-indigo-500 outline-none resize-none"
                                    />
                                    <button
                                        onClick={() => handleOptimize('experience', i)}
                                        disabled={optimizing === i}
                                        className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                        {optimizing === i ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                        {optimizing === i ? 'Optimizing...' : 'Optimize with AI'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Projects</h3>
                            <button onClick={() => addListItem('projects')} className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                                <Plus size={16} /> Add More
                            </button>
                        </div>
                        {resumeData.projects.map((proj, i) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-2xl relative group space-y-4">
                                <button onClick={() => removeListItem('projects', i)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="name" placeholder="Project Name" value={proj.name} onChange={(e) => handleListItemChange('projects', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-blue-500 outline-none w-full" />
                                    <input type="text" name="tech" placeholder="Technologies (e.g. React, Firebase)" value={proj.tech} onChange={(e) => handleListItemChange('projects', i, e)} className="p-3 bg-white rounded-lg border-transparent focus:border-blue-500 outline-none w-full" />
                                </div>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Describe your project..."
                                    value={proj.description}
                                    onChange={(e) => handleListItemChange('projects', i, e)}
                                    className="w-full p-4 bg-white rounded-xl border-transparent focus:border-blue-500 outline-none resize-none"
                                />
                            </div>
                        ))}
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900">Skills</h3>
                        <p className="text-sm text-slate-500">Enter skills separated by commas</p>
                        <textarea
                            rows={5}
                            placeholder="e.g. JavaScript, React, Python, SQL..."
                            value={resumeData.skills.join(', ')}
                            onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full p-6 bg-slate-50 rounded-[28px] border-transparent focus:border-blue-500 outline-none resize-none text-lg font-medium"
                        />
                    </motion.div>
                );
            case 6: // Final Preview Step
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-50">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 text-center">Your Resume is Ready!</h3>
                        <p className="text-slate-500 text-center max-w-xs">Double check the preview to ensure everything looks professional.</p>

                        <div className="mt-8">
                            {/* Final Download Button */}
                            <PDFDownloadLink
                                document={selectedTemplate === 'standard' ? <StandardTemplate data={resumeData} /> : <ModernTemplate data={resumeData} />}
                                fileName={`${resumeData.personal.name || 'Resume'}.pdf`}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 flex items-center gap-3 hover:bg-slate-900 transition-all"
                            >
                                {({ loading }) => (
                                    <>
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                                        {loading ? 'Generating PDF...' : 'Download Resume'}
                                    </>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen mesh-gradient pt-16 pb-20">
            <Navbar />
            <div className="">
                <main className="max-w-7xl mx-auto p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row justify-between items-center sm:items-start gap-6 mb-12"
                        >
                            <div className="text-center sm:text-left">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Resume <span className="text-indigo-600">Architect</span></h1>
                                <p className="text-lg text-slate-500 mt-2 font-medium">Design your professional future with AI-powered precision.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={saveResume}
                                    className="bg-white border-2 border-slate-100 p-3 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-2"
                                    title="Save Progress"
                                >
                                    <Save size={24} />
                                    {isSaving ? <span className="text-xs font-bold text-slate-400">Saving...</span> : lastSaved && <span className="text-xs font-bold text-emerald-500">Saved</span>}
                                </button>
                                <PDFDownloadLink
                                    document={selectedTemplate === 'standard' ? <StandardTemplate data={resumeData} /> : <ModernTemplate data={resumeData} />}
                                    fileName={`${resumeData.personal.name || 'Resume'}.pdf`}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                                >
                                    {({ loading }) => (
                                        <>
                                            <Download size={20} />
                                            {loading ? 'Preparing...' : 'Export PDF'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </motion.div>

                        <div className="grid lg:grid-cols-4 gap-12">
                            {/* Stepper */}
                            <div className="lg:col-span-1 space-y-3">
                                {steps.map((s, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentStep === i
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2'
                                            : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${currentStep === i ? 'bg-white/20' : 'bg-slate-100'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest">{s}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Builder and Preview Area */}
                            <div className="lg:col-span-3 space-y-12">
                                <div className="grid xl:grid-cols-2 gap-12 items-start">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-card p-8 lg:p-10 rounded-[40px] min-h-[500px] flex flex-col"
                                    >
                                        <div className="flex-1">
                                            {renderStepContent()}
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between gap-4">
                                            <button
                                                disabled={currentStep === 0}
                                                onClick={prevStep}
                                                className="flex items-center gap-2 px-6 py-3 text-slate-500 font-black text-sm hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronLeft size={20} /> Previous
                                            </button>
                                            {currentStep < 6 ? (
                                                <button
                                                    onClick={nextStep}
                                                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200"
                                                >
                                                    Next Step
                                                </button>
                                            ) : (
                                                <PDFDownloadLink
                                                    document={selectedTemplate === 'standard' ? <StandardTemplate data={resumeData} /> : <ModernTemplate data={resumeData} />}
                                                    fileName={`${resumeData.personal.name || 'Resume'}.pdf`}
                                                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                                                >
                                                    {({ loading }) => loading ? 'Preparing...' : 'Finish & Download'}
                                                </PDFDownloadLink>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Live Preview Column */}
                                    <div className="hidden xl:block bg-slate-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden h-fit sticky top-24">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent"></div>
                                        <div className="relative z-10 w-full aspect-[1/1.414] bg-white rounded-xl shadow-2xl overflow-hidden origin-top scale-[0.85] transform-gpu">
                                            <div ref={resumeRef} className="p-10 space-y-6 bg-white text-slate-900 h-full overflow-y-auto">
                                                <div className="border-b-2 border-slate-900 pb-3">
                                                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-2">
                                                        {resumeData.personal.name || 'Your Name'}
                                                    </h1>
                                                    <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase text-slate-400">
                                                        <span>{resumeData.personal.email}</span>
                                                        <span>{resumeData.personal.phone}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-indigo-600 border-b border-slate-100 pb-1 tracking-[0.2em]">Experience</h3>
                                                    {resumeData.experience.map((exp, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between font-black text-[11px] uppercase tracking-tight">
                                                                <span>{exp.company || 'Company Name'}</span>
                                                                <span className="text-slate-400">{exp.duration}</span>
                                                            </div>
                                                            <div className="text-[10px] font-black text-slate-600 italic">{exp.role}</div>
                                                            <div className="text-[9px] text-slate-500 leading-relaxed line-clamp-3">{exp.description}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-indigo-600 border-b border-slate-100 pb-1 tracking-[0.2em]">Projects</h3>
                                                    {resumeData.projects.map((proj, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <div className="flex justify-between font-black text-[11px] uppercase tracking-tight">
                                                                <span>{proj.name || 'Project Name'}</span>
                                                                <span className="text-slate-400 text-[9px]">{proj.tech}</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-500 leading-relaxed line-clamp-2">{proj.description}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-black uppercase text-indigo-600 border-b border-slate-100 pb-1 tracking-[0.2em]">Expertise</h3>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {resumeData.skills.filter(s => s).map((skill, i) => (
                                                            <span key={i} className="text-[8px] font-black uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-500">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative z-20 mt-6 text-center text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">
                                            Live AI Preview
                                        </div>
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

export default AIResumeBuilder;
