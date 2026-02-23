import nodemailer from "nodemailer";
import dns from "node:dns";
import dotenv from "dotenv";

dotenv.config();

// Prefer IPv4 when resolving SMTP hosts (helps on platforms where IPv6 is unreachable).
dns.setDefaultResultOrder("ipv4first");

function hasResendConfig() {
    return Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.RESEND_FROM);
}

function getTransporter() {
    const hasSmtpConfig =
        Boolean(process.env.SMTP_HOST) &&
        Boolean(process.env.SMTP_PORT) &&
        Boolean(process.env.SMTP_USER) &&
        Boolean(process.env.SMTP_PASS);

    if (!hasSmtpConfig) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        family: 4,
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

async function sendWithResend({ to, subject, html }) {
    const recipients = Array.isArray(to) ? to : [to];
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM,
            to: recipients,
            subject,
            html,
        }),
    });

    if (!response.ok) {
        let details = "";
        try {
            const payload = await response.json();
            details = payload?.message || JSON.stringify(payload);
        } catch {
            details = await response.text();
        }
        const error = new Error(
            `Resend API error (${response.status}): ${details || "Unknown error"}`,
        );
        error.code = "ERESEND_API";
        throw error;
    }
}

export async function sendEmail({ to, subject, html }) {
    if (hasResendConfig()) {
        try {
            await sendWithResend({ to, subject, html });
            return;
        } catch (error) {
            const mailError = new Error("Email delivery failed");
            mailError.code = "EMAIL_DELIVERY_FAILED";
            mailError.cause = error;
            throw mailError;
        }
    }

    const transporter = getTransporter();
    if (!transporter) {
        console.warn("Email provider config missing. Email not sent.");
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
        });
    } catch (error) {
        const mailError = new Error("Email delivery failed");
        mailError.code = "EMAIL_DELIVERY_FAILED";
        mailError.cause = error;
        throw mailError;
    }
}

export function buildVerificationEmailHtml({ appName, verificationUrl }) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Verify your email</h2>
            <p>Welcome to ${appName}. Please verify your email to activate your account.</p>
            <p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
                    Verify Email
                </a>
            </p>
            <p>If you did not create this account, you can ignore this email.</p>
            <p style="font-size: 12px; color: #6b7280;">This link will expire in 24 hours.</p>
        </div>
    `;
}
