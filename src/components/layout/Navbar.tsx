'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    GraduationCap,
    Search,
    Bell,
    Settings,
    UserCircle,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Users,
    Building2,
    FileText,
    BarChart3,
    PlusSquare,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
            router.refresh(); // Ensure strict state reset
            setIsProfileOpen(false);
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navItems = {
        student: [
            { name: 'Home', href: '/dashboard/student', icon: <LayoutDashboard size={24} /> },
            { name: 'Jobs', href: '/jobs', icon: <Briefcase size={24} /> },
            { name: 'Applications', href: '/dashboard/student/applications', icon: <ClipboardList size={24} /> },
            { name: 'Resume', href: '/resume', icon: <FileText size={24} /> },
        ],
        recruiter: [
            { name: 'Home', href: '/dashboard/recruiter', icon: <LayoutDashboard size={24} /> },
            { name: 'Post Job', href: '/dashboard/recruiter/post-job', icon: <PlusSquare size={24} /> },
            { name: 'Applicants', href: '/dashboard/recruiter/applicants', icon: <Users size={24} /> },
            { name: 'Company', href: '/dashboard/recruiter/profile', icon: <Building2 size={24} /> },
        ],
        admin: [
            { name: 'Analytics', href: '/dashboard/admin', icon: <BarChart3 size={24} /> },
            { name: 'Students', href: '/dashboard/admin/students', icon: <Users size={24} /> },
            { name: 'Recruiters', href: '/dashboard/admin/recruiters', icon: <Building2 size={24} /> },
            { name: 'Jobs', href: '/dashboard/admin/jobs', icon: <Briefcase size={24} /> },
        ],
    };

    const currentNav = user ? (navItems[user.role as keyof typeof navItems] || []) : [];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo & Search */}
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                    <Link href="/" className="flex-shrink-0 group">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-indigo-200">
                            <GraduationCap size={24} />
                        </div>
                    </Link>
                    <div className="hidden sm:flex flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-100/50 hover:bg-slate-200/50 focus:bg-white border-transparent focus:border-indigo-500 border-2 px-10 py-2 rounded-xl text-sm outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center h-full">
                    {currentNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center min-w-[80px] h-full px-2 border-b-2 transition-all ${isActive
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="w-px h-8 bg-slate-200 mx-4" />

                    {user ? (
                        <>
                            <Link
                                href="/notifications"
                                className="flex flex-col items-center justify-center min-w-[80px] h-full text-slate-500 hover:text-slate-900 border-b-2 border-transparent transition-all"
                            >
                                <div className="relative">
                                    <Bell size={24} />
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
                                </div>
                                <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">Notifications</span>
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative h-full ml-4">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex flex-col items-center justify-center min-w-[80px] h-full text-slate-500 hover:text-slate-900 border-b-2 border-transparent transition-all"
                                >
                                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px] overflow-hidden">
                                        {user?.name?.charAt(0) || <UserCircle size={24} />}
                                    </div>
                                    <span className="text-[10px] font-medium mt-1 uppercase tracking-wider flex items-center gap-0.5">
                                        Me ▼
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                                                        {user?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{user?.name}</div>
                                                        <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
                                                    </div>
                                                </div>
                                                <Link href="/profile" className="block w-full text-center mt-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors">
                                                    View Profile
                                                </Link>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                                                    <Settings size={18} /> Settings & Privacy
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                                                >
                                                    <LogOut size={18} /> Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                                Log In
                            </Link>
                            <Link href="/auth/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 top-14 z-40 bg-white lg:hidden overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-slate-100 border-transparent border px-10 py-3 rounded-xl text-sm outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {currentNav.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
                                    >
                                        {item.icon}
                                        <span className="text-xs font-bold mt-2">{item.name}</span>
                                    </Link>
                                ))}
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
                                >
                                    <Bell size={24} />
                                    <span className="text-xs font-bold mt-2">Notifications</span>
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
                                >
                                    <Settings size={24} />
                                    <span className="text-xs font-bold mt-2">Settings</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 text-red-600 active:scale-95 transition-all"
                                >
                                    <LogOut size={24} />
                                    <span className="text-xs font-bold mt-2">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
