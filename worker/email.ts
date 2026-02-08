import type { WorkerEnv } from "./db";

export async function sendOtpEmail(env: WorkerEnv, toEmail: string, code: string): Promise<boolean> {
  const apiKey = env.SENDGRID_API_KEY;
  const fromEmail = env.SENDGRID_FROM_EMAIL || "hello@bibletriviashow.com";

  if (!apiKey) {
    console.log("No SENDGRID_API_KEY set, logging OTP to console");
    console.log(`OTP for ${toEmail}: ${code}`);
    return true;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: "Debbie from Bible Trivia Show" },
        subject: "Your Bible Trivia Show Verification Code",
        content: [
          {
            type: "text/plain",
            value: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
          },
          {
            type: "text/html",
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF8F5;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #D4A017; margin: 0;">Bible Trivia Show</h1>
                  <p style="color: #5C4A32; margin-top: 5px;">Your Epic Bible Knowledge Journey</p>
                </div>
                <div style="background: linear-gradient(135deg, #D4A017 0%, #E6B830 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
                  <p style="color: #5C4A32; margin: 0 0 10px 0; font-size: 16px; font-weight: 500;">Your verification code is:</p>
                  <div style="background: rgba(255,255,255,0.85); border-radius: 8px; padding: 20px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; color: #5C4A32; letter-spacing: 8px;">${code}</span>
                  </div>
                </div>
                <div style="background: #F5F0E6; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E8DFD0;">
                  <p style="color: #5C4A32; margin: 0; font-size: 14px;">
                    This code will expire in <strong>10 minutes</strong>.
                  </p>
                  <p style="color: #8B7355; margin: 15px 0 0 0; font-size: 12px;">
                    If you didn't request this code, please ignore this email.
                  </p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #8B7355; font-size: 12px;">
                  <p>&copy; ${new Date().getFullYear()} Bible Trivia Show. All rights reserved.</p>
                </div>
              </div>
            `,
          },
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      console.log(`OTP email sent to ${toEmail}`);
      return true;
    }

    const errorBody = await response.text();
    console.error(`SendGrid error: ${response.status} ${errorBody}`);
    return false;
  } catch (error: any) {
    console.error("SendGrid error:", error.message || error);
    console.log(`OTP fallback for ${toEmail}: ${code}`);
    return true;
  }
}
