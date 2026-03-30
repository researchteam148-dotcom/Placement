import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(req: NextRequest) {
    try {
        const { messages, studentContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        // Build a personalized system prompt with the student's data
        let systemPrompt = `You are an AI Interview & Placement Assistant for Aditya University's Placement Portal. You help students with:

1. **Interview Preparation** — Tips for specific companies, common questions, coding rounds, HR interviews
2. **Resume Guidance** — How to highlight skills, format resumes, tailor for roles
3. **Career Advice** — Choosing between offers, salary negotiation, career paths
4. **Platform Help** — How to use the placement portal features (posting experiences, applying to jobs, resume builder)

Rules:
- Be encouraging and supportive
- Give specific, actionable advice
- Keep responses concise (under 200 words unless detailed explanation needed)
- If asked about something unrelated to placements/interviews/careers, politely redirect
- Use bullet points and formatting for clarity`;

        // Inject student-specific context if available
        if (studentContext) {
            systemPrompt += `\n\n--- STUDENT PROFILE (CONFIDENTIAL — only use to personalize advice) ---`;
            if (studentContext.name) systemPrompt += `\nName: ${studentContext.name}`;
            if (studentContext.email) systemPrompt += `\nEmail: ${studentContext.email}`;
            if (studentContext.branch) systemPrompt += `\nBranch: ${studentContext.branch}`;
            if (studentContext.regNo) systemPrompt += `\nRegistration Number: ${studentContext.regNo}`;
            if (studentContext.cgpa) systemPrompt += `\nCGPA: ${studentContext.cgpa}`;
            if (studentContext.gradYear) systemPrompt += `\nGraduation Year: ${studentContext.gradYear}`;
            if (studentContext.skills && studentContext.skills.length > 0) {
                systemPrompt += `\nSkills: ${studentContext.skills.join(', ')}`;
            }
            if (studentContext.backlogs !== undefined) systemPrompt += `\nBacklogs: ${studentContext.backlogs}`;
            systemPrompt += `\n--- END STUDENT PROFILE ---`;
            systemPrompt += `\n\nUse this profile data to give personalized advice. For example, if the student asks about their chances, reference their CGPA and skills. If they ask what to improve, suggest based on their current profile. Always address them by their first name.`;
        }

        // Build the message array for DeepSeek (OpenAI-compatible format)
        const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
                content: msg.content,
            })),
        ];

        const completion = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: apiMessages,
            max_tokens: 1024,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Chatbot error:', error.message);

        // Handle rate limiting gracefully
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return NextResponse.json({
                response: "I'm currently receiving too many requests. Please wait a few seconds and try again! 🤖⏱️"
            });
        }

        return NextResponse.json(
            { error: 'Failed to get AI response', details: error.message },
            { status: 500 }
        );
    }
}
