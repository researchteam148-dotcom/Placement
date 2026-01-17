import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

export async function GET() {
    try {
        const query = 'Software Engineer Intern India'; // Defaut search
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=5`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
                'x-rapidapi-host': 'jsearch.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`JSearch API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform JSearch items to our Job format
        const jobs = (data.data || []).map((item: any, index: number) => {
            return {
                id: item.job_id || `jsearch-${index}`,
                title: item.job_title || 'Unknown Role',
                company: item.employer_name || 'Hiring',
                location: item.job_city ? `${item.job_city}, ${item.job_country}` : (item.job_country || 'Remote'),
                salary: item.job_min_salary ? `$${item.job_min_salary} - $${item.job_max_salary}` : 'Not Disclosed',
                type: 'Off-Campus',
                deadline: item.job_offer_expiration_datetime_utc ? new Date(item.job_offer_expiration_datetime_utc).toLocaleDateString() : 'ASAP',
                applyLink: item.job_apply_link || item.job_google_link || '#',
                perks: [item.job_employment_type, item.job_is_remote ? 'Remote' : 'On-site', 'RapidAPI'].filter(Boolean),
                postedAt: item.job_posted_at_datetime_utc ? new Date(item.job_posted_at_datetime_utc).toISOString() : new Date().toISOString()
            };
        });

        // Batch write to Firestore
        const batch = writeBatch(db);
        jobs.forEach((job: any) => {
            const jobRef = doc(db, 'jobs', job.id);
            batch.set(jobRef, job, { merge: true });
        });
        await batch.commit();

        return NextResponse.json({ success: true, count: jobs.length, source: 'jsearch-api-cached' });

    } catch (error: any) {
        console.error('JSearch API failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
