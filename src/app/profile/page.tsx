'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    User,
    BookOpen,
    Save,
    Plus,
    Trash2,
    FileText,
    Upload,
    X,
    Download
} from 'lucide-react';
import { doc, updateDoc, getDoc, setDoc, collection, addDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [saving, setSaving] = useState(false);

    // Resume State
    const [resumes, setResumes] = useState<any[]>([]);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        cgpa: '',
        branch: 'Computer Science', // Default, but can be overwritten by fetch
        gradYear: '',
        batch: ''
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                const studentDoc = await getDoc(doc(db, 'students', user.uid));
                if (studentDoc.exists()) {
                    const data = studentDoc.data();
                    setSkills(data.skills || []);
                    setFormData({
                        cgpa: data.cgpa || '',
                        branch: data.branch || 'Computer Science',
                        gradYear: data.gradYear || '',
                        batch: data.batch || ''
                    });
                }
            }
        };
        fetchStudentData();
    }, [user]);

    // Fetch Resumes Real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'students', user.uid, 'savedResumes'), orderBy('uploadedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setResumes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'students', user.uid), {
                ...formData,
                skills: skills,
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: 'student'
            }, { merge: true });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const uploadResume = async () => {
        if (!fileToUpload || !user) return;

        setUploadingResume(true);
        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${fileToUpload.name}`);
            await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Save metadata to Firestore
            await addDoc(collection(db, 'students', user.uid, 'savedResumes'), {
                name: fileToUpload.name,
                url: downloadURL,
                uploadedAt: new Date().toISOString(),
                size: (fileToUpload.size / 1024 / 1024).toFixed(2) + ' MB'
            });

            setFileToUpload(null);
            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error("Error uploading resume:", error);
            alert("Failed to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    const deleteResume = async (resume: any) => {
        if (!confirm("Are you sure you want to delete this resume?")) return;
        try {
            // 1. Delete from Firestore
            await deleteDoc(doc(db, 'students', user!.uid, 'savedResumes', resume.id));

            // 2. Try to delete from Storage (might fail if we don't parse path correctly, but firestore is key)
            // Extract path from URL or just rely on Firestore deletion for UI
            // Ideally we store storagePath in firestore to make this easier. 
            // For now, we just remove the record.
        } catch (error) {
            console.error("Error deleting resume:", error);
            alert("Failed to delete resume record.");
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
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Changes'}
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
                                {/* Resume Vault */}
                                <div className="glass-card p-10 rounded-[40px] space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Resume Vault</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your CV versions</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Upload Area */}
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-300 hover:bg-slate-50/80">
                                            {fileToUpload ? (
                                                <div className="flex items-center gap-4 w-full max-w-md bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="flex-1 text-left overflow-hidden">
                                                        <div className="font-bold text-slate-900 truncate">{fileToUpload.name}</div>
                                                        <div className="text-xs text-slate-500 font-bold">{(fileToUpload.size / 1024 / 1024).toFixed(2)} MB</div>
                                                    </div>
                                                    <button
                                                        onClick={uploadResume}
                                                        disabled={uploadingResume}
                                                        className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {uploadingResume ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <Upload size={20} />}
                                                    </button>
                                                    <button onClick={() => setFileToUpload(null)} className="text-slate-400 hover:text-red-500 p-2">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                                        <Upload className="text-indigo-600" size={24} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-900 mb-1">Upload a New Resume</h4>
                                                    <p className="text-slate-500 text-sm font-medium mb-6">PDF formats only, max 5MB</p>
                                                    <label className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                                                        Select File
                                                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                                                    </label>
                                                </>
                                            )}
                                        </div>

                                        {/* Resume List */}
                                        <div className="grid gap-3">
                                            {resumes.map((resume) => (
                                                <div key={resume.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{resume.name}</div>
                                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                                {new Date(resume.uploadedAt).toLocaleDateString()} • {resume.size || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={resume.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Download/View"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                        <button
                                                            onClick={() => deleteResume(resume)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {resumes.length === 0 && (
                                                <div className="text-center py-4 text-slate-400 text-sm font-bold">
                                                    No resumes saved yet. Upload one to get started!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                            <input
                                                type="text"
                                                name="cgpa"
                                                value={formData.cgpa}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 9.24"
                                                className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Academic Branch</label>
                                            <select
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black appearance-none"
                                            >
                                                <option>Computer Science</option>
                                                <option>Information Tech</option>
                                                <option>Electronics</option>
                                                <option>Mechanical</option>
                                                <option>Civil</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Graduation Year</label>
                                            <input
                                                type="text"
                                                name="gradYear"
                                                value={formData.gradYear}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 2026"
                                                className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Batch</label>
                                            <input
                                                type="text"
                                                name="batch"
                                                value={formData.batch}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 2022-26"
                                                className="w-full bg-slate-50/50 px-6 py-4 rounded-[20px] border-2 border-slate-50 focus:border-indigo-600 focus:bg-white outline-none transition-all font-black"
                                            />
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
