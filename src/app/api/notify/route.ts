import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, company, role, status } = body;

        if (!email || !name || !company || !role || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine email content based on status
        const isShortlisted = status === 'Shortlisted';
        
        const subject = isShortlisted 
            ? `🎉 Congratulations! You've been shortlisted by ${company}` 
            : `Update on your application for ${role} at ${company}`;

        const color = isShortlisted ? '#4f46e5' : '#64748b'; // Indigo vs Slate
        const headingMessage = isShortlisted 
            ? `Great news, ${name}!` 
            : `Hello ${name},`;

        const bodyMessage = isShortlisted
            ? `We're thrilled to inform you that your application for the <strong>${role}</strong> position at <strong>${company}</strong> has been <strong>shortlisted</strong> for the next round of interviews.<br><br>The recruiter will be in touch with you shortly regarding the next steps.`
            : `Thank you for taking the time to apply for the <strong>${role}</strong> position at <strong>${company}</strong>. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.<br><br>We encourage you to keep applying to other opportunities on the platform. Review your dashboard to find new openings that match your skills.`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Inter', -apple-system, sans-serif; color: #334155; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
                        .container { max-w-width: 600px; margin: 0 auto; padding: 40px 20px; }
                        .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
                        .logo { text-align: center; margin-bottom: 30px; }
                        .logo h2 { color: #1e293b; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
                        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 24px; color: ${isShortlisted ? '#047857' : '#be123c'}; background-color: ${isShortlisted ? '#d1fae5' : '#ffe4e6'}; }
                        .heading { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
                        .message { font-size: 16px; color: #475569; margin-bottom: 30px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #94a3b8; }
                        .btn { display: inline-block; padding: 12px 24px; background-color: ${color}; color: white !important; font-weight: bold; text-decoration: none; border-radius: 8px; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">
                                <h2>Placement Portal</h2>
                            </div>
                            
                            <div class="status-badge">${status}</div>
                            
                            <h1 class="heading">${headingMessage}</h1>
                            
                            <div class="message">
                                <p>${bodyMessage}</p>
                            </div>
                            
                            <center>
                                <a href="https://promptify.fun/dashboard/student" class="btn">View Dashboard</a>
                            </center>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from the Placement Portal.</p>
                            <p>© ${new Date().getFullYear()} Placement Automation Platform.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Placement Portal <notifications@promptify.fun>',
            to: [email],
            replyTo: 'support@promptify.fun',
            subject: subject,
            html: htmlContent,
            text: bodyMessage.replace(/<[^>]*>?/gm, ''), // Strip HTML tags for plaintext
            tags: [
                {
                    name: 'category',
                    value: 'application_update',
                }
            ]
        });

        if (error) {
            console.error('Resend API Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Notification sent successfully', data });
        
    } catch (error: any) {
        console.error('Notification Route Error:', error);
        return NextResponse.json(
            { error: 'Failed to process notification request' }, 
            { status: 500 }
        );
    }
}
