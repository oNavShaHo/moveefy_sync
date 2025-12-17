import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY || "re_YAotxSUR_FaRptkMXHmAwsMxS6FALyZmx"
);

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateVerificationEmailHtml(
  username: string,
  verificationLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Moviefy</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Moviefy</h1>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${username}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for signing up for Moviefy. To complete your registration and start enjoying synchronized music and movies with your friends, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #9333ea; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">
              ${verificationLink}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              This verification link will expire in 24 hours. If you didn't create an account with Moviefy, please ignore this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" ;
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    // Determine from email based on environment
    // For Resend, you can use onboarding@resend.dev for testing
    // In production, use your verified domain like noreply@yourdomain.com
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `Moviefy <${fromEmail}>`,
      to: email,
      subject: "Verify your email - Moviefy",
      html: generateVerificationEmailHtml(username, verificationLink),
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message || "Failed to send email" };
    }

    // Log for development
    if (process.env.NODE_ENV === "development") {
      console.log("=== VERIFICATION EMAIL SENT ===");
      console.log(`To: ${email}`);
      console.log(`Link: ${verificationLink}`);
      console.log(`Email ID: ${data?.id}`);
      console.log("=============================");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: error.message || "Failed to send verification email",
    };
  }
}
