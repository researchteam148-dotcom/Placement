
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'Configuration Error',
                details: 'GOOGLE_API_KEY is not set in environment variables.'
            }, { status: 500 });
        }

        const { resumeURL } = await request.json();

        if (!resumeURL) {
            return NextResponse.json({ error: 'Missing resume content' }, { status: 400 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log("Using API Key:", apiKey.substring(0, 5) + "...");

        // If it's a PDF base64 data URL, we need to extract the base64 part
        // 'data:application/pdf;base64,JVBERi0xLjQK...'
        let parts = [];
        if (resumeURL.startsWith('data:')) {
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
        } else {
            // Assume plain text if not base64 (fallback)
            parts = [{ text: `Analyze this resume content: \n ${resumeURL}` }];
        }

        const prompt = `
            Please evaluate this resume and provide a structured review.
            Output must be valid JSON strictly adhering to this schema:
            {
                "score": number (0-100),
                "strengths": string[] (3-5 bullet points),
                "weaknesses": string[] (3-5 bullet points),
                "suggestions": string[] (3-5 actionable improvements)
            }
            Do not include markdown code blocks (like \`\`\`json). Just the raw JSON string.
        `;

        // List of models to attempt. 
        // Note: 'gemini-3-pro-preview' caused immediate quota errors (limit 0).
        const modelsToTry = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let result;
        let usedModel = "";
        const errors = [];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent([prompt, ...parts]);
                usedModel = modelName;
                break;
            } catch (e: any) {
                const msg = e.message || "Unknown Error";
                console.error(`Failed with ${modelName}:`, msg);

                // Categorize error for debug report
                let status = "Unknown";
                if (msg.includes("404")) status = "Not Found (Check API Key)";
                if (msg.includes("429")) status = "Quota Exceeded (Free Tier Limit)";

                errors.push(`${modelName}: ${status}`);
            }
        }

        if (!result) {
            console.error("All models failed.");
            return NextResponse.json({
                error: 'Analysis Failed',
                details: `All models failed. Debug info:\n${errors.join('\n')}\n\nReview your API Key permissions in Google AI Studio.`
            }, { status: 503 }); // 503 Service Unavailable
        }

        console.log(`Success with model: ${usedModel}`);
        const response = await result.response;
        const text = response.text();

        // simple cleanup if model wrapped in code fence
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(cleanText);

        return NextResponse.json(analysis);

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({
            error: 'Analysis Failed',
            details: error.message
        }, { status: 500 });
    }
}
