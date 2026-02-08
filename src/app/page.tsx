'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  GraduationCap,
  LineChart,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen mesh-gradient overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100/50 backdrop-blur-sm text-indigo-700 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest mb-10 border border-indigo-200">
              <Zap size={16} className="fill-indigo-700" />
              <span>Transforming Campus Placements</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight">
              Elevate Your Future <br />
              <span className="text-indigo-600">Career</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-bold">
              The all-in-one AI ecosystem connecting students, recruiters, and placement nodes in a seamless digital experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/auth/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-1 active:scale-95"
              >
                Join as Student <ArrowRight size={22} />
              </Link>
              <Link
                href="/auth/register?role=recruiter"
                className="bg-white/80 backdrop-blur-md border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 text-slate-900 px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-100"
              >
                Hire Top Talent
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mt-12 lg:mt-0"
          >
            <img
              src="/working.png"
              alt="Platform Dashboard Preview"
              className="w-full h-auto rounded-2xl lg:rounded-3xl shadow-2xl"
            />
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>
          </motion.div>
        </div>
      </section>

      {/* Role Section */}
      <section className="py-32 bg-white relative px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Tailored for Success</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-bold">One platform, three powerful roles designed for excellence.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            {
              role: 'Students',
              icon: <GraduationCap className="text-indigo-600" size={40} />,
              features: ['AI Job Recommendations', 'Smart Resume Builder', 'Application Insights'],
              color: 'indigo'
            },
            {
              role: 'Recruiters',
              icon: <Building2 className="text-indigo-600" size={40} />,
              features: ['Bulk AI Shortlisting', 'Company Branding', 'Performance Analytics'],
              color: 'indigo'
            },
            {
              role: 'Admin',
              icon: <ShieldCheck className="text-indigo-800" size={40} />,
              features: ['University Overview', 'Automated Workflows', 'Audit Logs'],
              color: 'slate'
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              className="p-10 rounded-[40px] border-2 border-slate-50 bg-slate-50 hover:bg-white hover:shadow-[0_30px_70px_rgba(0,0,0,0.05)] hover:border-indigo-100 transition-all duration-500 group"
            >
              <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-50 w-fit mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{item.role}</h3>
              <ul className="space-y-5">
                {item.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-slate-500 text-sm font-black uppercase tracking-widest">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {[
            { label: 'Placements', val: '5000+' },
            { label: 'Recruiters', val: '200+' },
            { label: 'Departments', val: '12+' },
            { label: 'Daily Leads', val: '10k+' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-5xl font-black mb-3 text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">{stat.val}</div>
              <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </section>
    </div>
  );
};

export default LandingPage;
