import { Timestamp, FieldValue } from 'firebase/firestore';

export type UserRole = 'admin' | 'recruiter' | 'student';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Timestamp | FieldValue | Date; // IMPROVED: Better type safety
    profileCompleted: boolean;
}

export interface Student {
    uid: string;
    cgpa?: number;
    branch?: string;
    skills?: string[];
    resumeURL?: string;
    batch?: string;
    gradYear?: string;
    graduationYear?: number;
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
    company: string; // IMPROVED: Consistent naming (was companyName)
    type: 'On-Campus' | 'Off-Campus';
    employmentType?: 'Full-time' | 'Internship' | 'Remote';
    eligibility?: string;
    postedBy: string; // Recruiter UID
    applyLink?: string;
    description: string;
    salary?: string; // IMPROVED: Consistent naming (was package)
    deadline?: Timestamp | FieldValue | string;
    postedAt: Timestamp | FieldValue | string;
    applicants?: number; // IMPROVED: Consistent naming (was applicantsCount)
    logo?: string;
    location?: string;
    responsibilities?: string[];
    requirements?: string[];
    perks?: string[];
}

export interface Application {
    id: string;
    jobId: string;
    studentId: string;
    studentName: string;
    status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Accepted';
    appliedAt: Timestamp | FieldValue | string;
    resumeUrl?: string; // IMPROVED: Consistent naming (was resumeSnapshot)
    resumeName?: string;
}
