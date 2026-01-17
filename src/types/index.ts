export type UserRole = 'admin' | 'recruiter' | 'student';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: any;
    profileCompleted: boolean;
}

export interface Student {
    uid: string;
    cgpa: number;
    branch: string;
    skills: string[];
    resumeURL: string;
    batch: string;
    graduationYear: number;
}

export interface Recruiter {
    uid: string;
    companyName: string;
    approved: boolean;
    industry?: string;
    website?: string;
}

export interface Job {
    id: string;
    title: string;
    companyName: string;
    type: 'on-campus' | 'off-campus';
    eligibility: string;
    postedBy: string; // Recruiter UID
    applyLink: string;
    description: string;
    package: string;
    deadline: any;
    postedAt: any;
    applicantsCount: number;
}

export interface Application {
    id: string;
    jobId: string;
    studentId: string;
    studentName: string;
    status: 'pending' | 'shortlisted' | 'rejected' | 'accepted';
    appliedAt: any;
    resumeSnapshot: string;
}
