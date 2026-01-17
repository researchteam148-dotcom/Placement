'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <Navbar />
            <main className="max-w-4xl mx-auto p-12 bg-white mt-12 mb-20 rounded-[40px] shadow-sm border border-slate-100">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8 font-display">Privacy Policy</h1>
                <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium">
                    <p>At PlacementHub, we take your privacy seriously. This policy describes how we collect, use, and handle your data when you use our platform.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">1. Information We Collect</h2>
                    <p>We collect information you provide directly, such as when you create an account (name, email), upload a resume, or apply for jobs. We also collect data from Google Sign-In if you choose that option.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">2. How We Use Data</h2>
                    <p>Your data is used to match students with job opportunities, facilitate communication between recruiters and candidates, and improve our services through analytics.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">3. Data Sharing</h2>
                    <p>Student profile data and resumes are shared with recruiters of companies you explicitly apply to. We do not sell your personal information to third parties.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">4. Security</h2>
                    <p>We use industry-standard security measures, including Firebase Authentication and Firestore Security Rules, to protect your data.</p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
