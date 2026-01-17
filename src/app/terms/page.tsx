'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-[72px]">
            <Navbar />
            <main className="max-w-4xl mx-auto p-12 bg-white mt-12 mb-20 rounded-[40px] shadow-sm border border-slate-100">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8 font-display">Terms of Service</h1>
                <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium">
                    <p>By using PlacementHub, you agree to the following terms and conditions. Please read them carefully.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">1. Use of Platform</h2>
                    <p>PlacementHub is a platform for academic placement activities. Users must provide accurate information and use the platform in a professional manner.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">2. Roles and Responsibilities</h2>
                    <p>Students are responsible for the accuracy of their resumes. Recruiters are responsible for the validity of their job postings. Admins reserve the right to moderate content.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">3. Prohibited Activities</h2>
                    <p>Any attempt to scrape data without authorization, harass other users, or provide fraudulent information will result in immediate termination of the account.</p>

                    <h2 className="text-2xl font-bold text-slate-800 pt-4">4. Limitation of Liability</h2>
                    <p>While we strive for excellence, PlacementHub is provided "as is" without any guarantees regarding employment outcomes.</p>
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
