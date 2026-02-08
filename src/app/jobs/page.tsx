'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    Filter,
    ChevronRight,
    TrendingUp,
    Building2,
    ChevronLeft,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Global cache to persist data across navigations within the session
const jobsCache: { [key: string]: { data: any[], timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes fresh

const JobsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'on-campus' | 'off-campus'>('on-campus');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch Jobs from Firestore
    useEffect(() => {
        // 1. Check cache first for instant load
        const cacheKey = activeTab;
        if (jobsCache[cacheKey] && (Date.now() - jobsCache[cacheKey].timestamp < CACHE_DURATION)) {
            setJobs(jobsCache[cacheKey].data);
            setLoading(false);
        } else {
            setLoading(true); // Only show spinner if no cache or stale
        }

        // 2. Setup listener for updates (and to refresh cache)
        const typeFilter = activeTab === 'on-campus' ? 'On-Campus' : 'Off-Campus';
        const q = query(
            collection(db, 'jobs'),
            where('type', '==', typeFilter)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side sort
            jobsData.sort((a: any, b: any) => {
                const dateA = new Date(a.postedAt || 0).getTime();
                const dateB = new Date(b.postedAt || 0).getTime();
                return dateB - dateA;
            });

            // Update state and cache
            setJobs(jobsData);
            jobsCache[cacheKey] = { data: jobsData, timestamp: Date.now() };
            setLoading(false);

            // Reset page if we are on page 1, otherwise stick to current page unless out of bounds
            if (currentPage === 1) setCurrentPage(1);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    // Handle Manual Refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetch('/api/jobs/scrape');
        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleFilterChange = (type: string) => {
        setSelectedJobTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        // 1. Search Term
        const matchesSearch =
            job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // 2. Employment Type Filter
        if (selectedJobTypes.length > 0) {
            // Check both old 'type' field (if it had values) and new 'employmentType' field
            // The job.type is likely 'On-Campus'/'Off-Campus', but job.employmentType should be 'Full-time', etc.
            // also checks if the type is in perks tags
            const jobType = job.employmentType || job.type; // Fallback
            const perks = job.perks || [];

            const matchesType = selectedJobTypes.some(selected =>
                jobType === selected || perks.includes(selected)
            );

            if (!matchesType) return false;
        }

        return true;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

    const filterOptions = ['Full-time', 'Internship', 'Remote']; // Removed 'Contract'

    return (
        <div className="min-h-screen mesh-gradient pt-16">
            <Navbar />

            {/* Search Header */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Find Your <span className="text-indigo-600">Dream Career</span>
                        </h1>
                        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                            Discover high-impact opportunities from top companies, hand-picked for your skills and aspirations.
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex justify-center mb-8 gap-4 items-center">
                        <button
                            onClick={() => setActiveTab('on-campus')}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'on-campus'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            On-Campus
                        </button>
                        <button
                            onClick={() => setActiveTab('off-campus')}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'off-campus'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Off-Campus
                        </button>

                        {/* Refresh Button (Only for Off-Campus) */}
                        {activeTab === 'off-campus' && (
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-white p-3 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200 disabled:opacity-50"
                                title="Refresh Jobs from API"
                            >
                                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>

                    <div className="max-w-4xl mx-auto p-2 bg-white rounded-[24px] shadow-2xl shadow-indigo-100/50 flex flex-col md:flex-row gap-2 border border-indigo-50">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                            <input
                                type="text"
                                placeholder="Search by title, role or company..."
                                className="w-full pl-16 pr-6 py-5 bg-transparent focus:outline-none text-slate-900 font-bold text-lg placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[20px] font-black text-lg transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] active:scale-95">
                            Search Jobs
                        </button>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20 grid lg:grid-cols-4 gap-12">
                {/* Filters sidebar */}
                <aside className="hidden lg:block space-y-10 sticky top-32 h-fit">
                    <div className="glass-card p-8 rounded-[32px]">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
                            <Filter size={20} className="text-indigo-600" /> Filters
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Employment Type</h4>
                                <div className="space-y-3">
                                    {filterOptions.map((f) => (
                                        <label key={f} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedJobTypes.includes(f)}
                                                    onChange={() => handleFilterChange(f)}
                                                    className="peer w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-0 checked:border-indigo-600 transition-all cursor-pointer opacity-0 absolute inset-0 z-10"
                                                />
                                                <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-indigo-400 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                                                    {selectedJobTypes.includes(f) && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-slate-600 font-bold group-hover:text-slate-900 transition-colors">{f}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Listings */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white">
                        <span className="text-slate-500 font-bold text-sm">Showing <span className="text-slate-900">{filteredJobs.length}</span> jobs found</span>
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm cursor-pointer hover:text-indigo-600 transition-colors">
                            Sort by: Most Recent <ChevronRight size={18} />
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {loading && jobs.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">Loading opportunities...</div>
                        ) : currentJobs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900">No Jobs Found</h3>
                                <p className="text-slate-500">
                                    {activeTab === 'off-campus'
                                        ? 'Click the Refresh button to fetch latest jobs.'
                                        : 'Try adjusting filters or check back later.'}
                                </p>
                            </div>
                        ) : (
                            currentJobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white border-2 border-slate-50 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="flex gap-8 items-start">
                                            <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-[28px] flex items-center justify-center font-black text-3xl text-slate-900 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500 shadow-sm uppercase">
                                                {job.company?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                                        {job.title}
                                                    </h2>
                                                    {activeTab === 'off-campus' && (
                                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                            <TrendingUp size={12} /> Hot
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-5 text-sm text-slate-500 font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={18} className="text-indigo-500" /> {job.company}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={18} className="text-indigo-500" /> {job.location}
                                                    </div>
                                                    <div className="text-slate-900 flex items-center gap-1">
                                                        <span className="text-emerald-600">₹</span> {job.salary}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-6">
                                                    {job.perks?.map((tag: string) => (
                                                        <span key={tag} className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-6">
                                            <div className="text-right">
                                                <span className={`inline-block px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest ${activeTab === 'on-campus'
                                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    }`}>
                                                    {activeTab === 'on-campus' ? 'On-Campus' : 'Off-Campus'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-3 font-bold justify-end">
                                                    <Clock size={16} /> {job.deadline || 'ASAP'}
                                                </div>
                                            </div>
                                            <Link
                                                href={job.applyLink || `/jobs/${job.id}`}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 active:scale-95 whitespace-nowrap"
                                                target={activeTab === 'off-campus' ? '_blank' : '_self'}
                                            >
                                                {activeTab === 'off-campus' ? 'Apply Now' : 'View Details'}
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-10">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-black text-slate-900 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
