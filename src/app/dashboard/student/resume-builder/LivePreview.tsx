import React from 'react';

interface LivePreviewProps {
    data: {
        personal: { name: string; email: string; phone: string; linkedin: string; github: string };
        education: { school: string; degree: string; year: string; cgpa: string }[];
        experience: { company: string; role: string; duration: string; description: string }[];
        projects: { name: string; tech: string; description: string; link: string }[];
        skills: string[];
        customSections?: { id: string; title: string; content: string }[];
    };
    template: 'standard' | 'modern';
}

const LivePreview: React.FC<LivePreviewProps> = ({ data, template }) => {
    const renderStandard = () => (
        <div className="p-12 font-serif text-[#333] leading-relaxed h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="text-center border-b border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{data.personal.name || 'Your Name'}</h1>
                <div className="flex justify-center gap-4 text-xs">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.linkedin && <span>LinkedIn</span>}
                    {data.personal.github && <span>GitHub</span>}
                </div>
            </div>

            {/* Education */}
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Education</h2>
                {data.education.map((edu, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between font-bold text-sm">
                            <span>{edu.school || 'University Name'}</span>
                            <span>{edu.year}</span>
                        </div>
                        <div className="flex justify-between text-xs italic">
                            <span>{edu.degree}</span>
                            <span>{edu.cgpa && `CGPA: ${edu.cgpa}`}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience */}
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Experience</h2>
                {data.experience.map((exp, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between font-bold text-sm">
                            <span>{exp.company || 'Company Name'}</span>
                            <span>{exp.duration}</span>
                        </div>
                        <div className="text-xs italic mb-1">{exp.role}</div>
                        <p className="text-[10px] text-justify">{exp.description}</p>
                    </div>
                ))}
            </div>

            {/* Projects */}
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Projects</h2>
                {data.projects.map((proj, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between font-bold text-sm">
                            <span>{proj.name || 'Project Name'}</span>
                            <span className="text-[10px] font-normal">{proj.tech}</span>
                        </div>
                        <p className="text-[10px] text-justify">{proj.description}</p>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <div className="mb-6">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-3">Skills</h2>
                <p className="text-xs">{data.skills.filter(s => s).join(', ')}</p>
            </div>

            {/* Custom Sections */}
            {data.customSections?.map((section) => (
                <div key={section.id} className="mb-6">
                    <h2 className="text-sm font-bold uppercase border-b border-black mb-3">{section.title}</h2>
                    <p className="text-[10px] text-justify whitespace-pre-line">{section.content}</p>
                </div>
            ))}
        </div>
    );

    const renderModern = () => (
        <div className="flex h-full font-sans text-slate-800 overflow-hidden">
            {/* Left Column */}
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-200 overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                    <h1 className="text-2xl font-black uppercase leading-tight mb-4">{data.personal.name || 'Your Name'}</h1>
                    <div className="space-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2"> {data.personal.email}</div>
                        <div className="flex items-center gap-2"> {data.personal.phone}</div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.filter(s => s).map((skill, i) => (
                            <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200 text-[9px] font-bold uppercase">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4">Education</h2>
                    {data.education.map((edu, i) => (
                        <div key={i} className="mb-4">
                            <div className="text-[10px] font-black">{edu.school}</div>
                            <div className="text-[9px] text-slate-500 font-bold">{edu.degree}</div>
                            <div className="text-[9px] text-slate-400">{edu.year}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column */}
            <div className="w-2/3 p-8 overflow-y-auto custom-scrollbar bg-white">
                <div className="mb-8">
                    <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-2 mb-4">Experience</h2>
                    {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-black uppercase">{exp.company}</h3>
                                <span className="text-[9px] font-bold text-slate-400">{exp.duration}</span>
                            </div>
                            <div className="text-[10px] font-bold text-indigo-500 italic mb-2">{exp.role}</div>
                            <p className="text-[10px] text-slate-600 leading-relaxed text-justify">{exp.description}</p>
                        </div>
                    ))}
                </div>

                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-2 mb-4">Projects</h2>
                    {data.projects.map((proj, i) => (
                        <div key={i} className="mb-6">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-black uppercase">{proj.name}</h3>
                                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded">{proj.tech}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed text-justify">{proj.description}</p>
                        </div>
                    ))}
                </div>

                {/* Custom Sections */}
                {data.customSections?.map((section) => (
                    <div key={section.id} className="mt-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-slate-100 pb-2 mb-4">{section.title}</h2>
                        <p className="text-[10px] text-slate-600 leading-relaxed text-justify whitespace-pre-line">{section.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full bg-white shadow-2xl overflow-hidden">
            {template === 'standard' ? renderStandard() : renderModern()}
        </div>
    );
};

export default LivePreview;
