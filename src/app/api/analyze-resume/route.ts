import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

// REMOVED: S3 client import - no longer needed
// IMPROVED: Cleaner API route with better error handling and logging

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            logger.error('GOOGLE_API_KEY is not set in environment variables');
            return NextResponse.json({
                error: 'Configuration Error',
                details: 'AI service is not configured properly.'
            }, { status: 500 });
        }

        const { resumeURL, jobDescription } = await request.json();

        if (!resumeURL) {
            return NextResponse.json({
                error: 'Missing resume content'
            }, { status: 400 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        logger.debug('Initializing Gemini AI for resume analysis');

        // Prepare parts for analysis
        let parts: any[] = [];

        if (resumeURL.startsWith('data:')) {
            // Case 1: Base64 Data URL (Legacy/Local)
            const base64Data = resumeURL.split(',')[1];
            const mimeType = resumeURL.split(';')[0].split(':')[1];

            parts = [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                },
                { text: "Analyze this resume. Act as an expert hiring manager." }
            ];

        } else if (resumeURL.includes('firebasestorage.googleapis.com')) {
            // Case 2: Firebase Storage URL (Primary method)
            try {
                logger.debug('Fetching resume from Firebase Storage');
                const response = await fetch(resumeURL);

                if (!response.ok) {
                    throw new Error(`Failed to fetch from Firebase Storage: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const base64Data = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = response.headers.get('content-type') || 'application/pdf';

                parts = [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    { text: "Analyze this resume. Act as an expert hiring manager." }
                ];

            } catch (fetchError: any) {
                logger.error('Error fetching from Firebase Storage:', fetchError.message);
                return NextResponse.json({
                    error: 'Firebase Fetch Failed',
                    details: 'Failed to retrieve resume from Firebase Storage.'
                }, { status: 500 });
            }
        } else {
            // REMOVED: S3 support - application now uses Firebase Storage exclusively
            logger.error('Unsupported resume URL format:', resumeURL);
            return NextResponse.json({
                error: 'Invalid Resume URL',
                details: 'Resume must be stored in Firebase Storage.'
            }, { status: 400 });
        }

        // Build the prompt - RESTORED original format for frontend compatibility
        const prompt = `
            Analyze this resume using Advanced Natural Language Processing (NLP) and Semantic Analysis. 
            Act as an expert Technical Recruiter and ATS Optimization engine.

            ${jobDescription ? `CORE TASK: Perform semantic matching against this Job Description: ${jobDescription}` : 'CORE TASK: Perform a general professional audit.'}

            Linguistic & NLP Criteria:
            1. Action Verb Analysis: Identify passive vs. strong active verbs. Calculate "Impact Density".
            2. Quantifiability: Detect numerical metrics (%) supporting achievements. Use entity recognition for results.
            3. Semantic Similarity: Do not just match keywords; match concepts (e.g., "Node.js" matches "Backend JavaScript frameworks").
            4. Formatting Heuristics: Evaluate if the text flow is optimized for NLP-based ATS parsers.
            5. Buzzword/Cliché Detection: Identify overused, meaningless phrases (e.g., "Team player", "Passionate").

            Provide a comprehensive review in strict JSON format.
            Schema:
            {
                "score": number (0-100 overall score based on quantified impact and semantic relevance),
                "categories": {
                    "ats": { "score": number, "label": "ATS Parsing & NLP Flow", "feedback": "Feedback on text structure" },
                    "impact": { "score": number, "label": "Linguistic Impact & Verbs", "feedback": "Feedback on verb strength and quantifiers" },
                    "skills": { "score": number, "label": "Semantic Skill Match", "feedback": "Concept-level skill alignment" },
                    "formatting": { "score": number, "label": "Readability & Layout", "feedback": "Visual/Mechanical feedback" }
                },
                "topFixes": [
                    { "category": "NLP Parsing Issue" | "Weak Action Verbs" | "Low Quantifiability" | "Generic Language", "score": number (1-10 priority), "status": "critical" | "warning" | "good", "description": "Specific, actionable linguistic advice" }
                ],
                "strengths": string[] (Include specific NLP-positive traits found),
                "suggestions": string[] (Include specific NLP-optimization tips),
                "jdMatch": ${jobDescription ? '{ "score": number (Semantic Match %), "summary": "Concept-level similarity summary" }' : 'null'}
            }
            Do not include markdown code blocks. Just raw JSON.
        `;

        // Try multiple models for resilience - using latest Gemini 2.5 Flash
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ];

        let result;
        let usedModel = "";
        const errors = [];

        for (const modelName of modelsToTry) {
            try {
                logger.debug(`Attempting with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent([prompt, ...parts]);
                usedModel = modelName;
                break;
            } catch (e: any) {
                const msg = e.message || "Unknown Error";
                logger.warn(`Failed with ${modelName}: ${msg}`);

                // Categorize error for debug report
                let status = "Unknown";
                if (msg.includes("404")) status = "Not Found (Check API Key & Enable Generative Language API)";
                if (msg.includes("429")) status = "Quota Exceeded (Free Tier Limit)";

                errors.push(`${modelName}: ${status}`);
            }
        }

        if (!result) {
            logger.error("All models failed.");
            return NextResponse.json({
                error: 'Analysis Failed',
                details: `All models failed. Debug info:\n${errors.join('\n')}\n\nReview your API Key permissions in Google AI Studio.`
            }, { status: 503 });
        }

        logger.info(`Success with model: ${usedModel}`);
        const response = await result.response;
        const text = response.text();

        // Simple cleanup if model wrapped in code fence
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(cleanText);

        // Return analysis directly
        return NextResponse.json(analysis);

    } catch (error: any) {
        logger.error('Resume analysis error:', error.message);
        return NextResponse.json({
            error: 'Analysis Failed',
            details: error.message || 'An unexpected error occurred.'
        }, { status: 500 });
    }
}
