'use client';

import React from 'react';
import { FileText, Download, BarChart2, PieChart } from 'lucide-react';

const AdminReportsPage = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Placement Reports</h1>
                    <p className="text-slate-500 mt-1">Generate and download comprehensive placement analytics.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { title: 'Placement Summary 2026', desc: 'Complete breakdown of hiring across all departments.', icon: <BarChart2 /> },
                    { title: 'Company Participation', desc: 'List of companies visited and offer distributions.', icon: <PieChart /> },
                    { title: 'Salary Packages Report', desc: 'Highest, lowest, and average packages for the current batch.', icon: <FileText /> },
                    { title: 'Student Eligibility Status', desc: 'Detailed list of students and their current placement status.', icon: <FileText /> },
                ].map((report, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 flex items-start gap-6 shadow-sm hover:border-indigo-200 transition-colors group">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {report.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{report.title}</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{report.desc}</p>
                            <button className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                                <Download size={18} /> Download CSV
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReportsPage;
