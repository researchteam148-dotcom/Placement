import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const SYSTEM_PROMPT = `You are an AI Interview & Placement Assistant for Aditya University's Placement Portal. You help students with:

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

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
        });

        const lastMessage = messages[messages.length - 1];
        const prompt = messages.length === 1
            ? `${SYSTEM_PROMPT}\n\nUser: ${lastMessage.content}`
            : lastMessage.content;

        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('Chatbot error:', error);
        return NextResponse.json(
            { error: 'Failed to get AI response', details: error.message },
            { status: 500 }
        );
    }
}
