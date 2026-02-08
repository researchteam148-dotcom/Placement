// Application Constants

export const USER_ROLES = {
    ADMIN: 'admin',
    RECRUITER: 'recruiter',
    STUDENT: 'student',
} as const;

export const FIRESTORE_COLLECTIONS = {
    USERS: 'users',
    STUDENTS: 'students',
    RECRUITERS: 'recruiters',
    JOBS: 'jobs',
    APPLICATIONS: 'applications',
    SAVED_RESUMES: 'savedResumes',
} as const;

export const JOB_TYPES = {
    ON_CAMPUS: 'On-Campus',
    OFF_CAMPUS: 'Off-Campus',
} as const;

export const EMPLOYMENT_TYPES = {
    FULL_TIME: 'Full-time',
    INTERNSHIP: 'Internship',
    REMOTE: 'Remote',
} as const;

export const APPLICATION_STATUS = {
    PENDING: 'Pending',
    SHORTLISTED: 'Shortlisted',
    REJECTED: 'Rejected',
    ACCEPTED: 'Accepted',
} as const;

export const QUERY_LIMITS = {
    JOBS_PER_PAGE: 20,
    APPLICATIONS_PER_PAGE: 10,
    STUDENTS_PER_PAGE: 20,
    MAX_RESUMES: 10,
} as const;

export const FILE_CONSTRAINTS = {
    MAX_RESUME_SIZE_MB: 5,
    ALLOWED_RESUME_TYPES: ['.pdf'],
    MAX_LOGO_SIZE_MB: 2,
    ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const CACHE_DURATION = {
    JOBS_CACHE_MS: 5 * 60 * 1000, // 5 minutes
    PROFILE_CACHE_MS: 10 * 60 * 1000, // 10 minutes
} as const;
