import crypto from "crypto";

import { Resend } from "resend";
import twilio from "twilio";

import { prisma } from "@/lib/prisma";

export type OtpPurpose = "EMAIL_VERIFICATION" | "MOBILE_VERIFICATION";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@localhost";
const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES ?? "5");

export function generateOtpCode(length = 6) {
  const digits = "0123456789";
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += digits[Math.floor(Math.random() * digits.length)];
  }

  return value;
}

export function sha256Hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function createOtpRecord({
  email,
  phone,
  userId,
  purpose,
}: {
  email?: string;
  phone?: string;
  userId?: string;
  purpose: OtpPurpose;
}) {
  const code = generateOtpCode();
  const expiryPeriodMs = otpExpiryMinutes * 60 * 1000;

  const savedOtp = await prisma.otpVerification.create({
    data: {
      userId: userId ?? null,
      email: email ? email.trim().toLowerCase() : null,
      phone: phone ? phone.trim() : null,
      purpose,
      code: sha256Hash(code),
      expiresAt: new Date(Date.now() + expiryPeriodMs),
    },
  });

  return { code, otp: savedOtp };
}

export async function verifyOtp({
  email,
  phone,
  code,
  purpose,
}: {
  email?: string;
  phone?: string;
  code: string;
  purpose: OtpPurpose;
}) {
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const normalizedPhone = phone ? phone.trim() : null;

  const candidates = await prisma.otpVerification.findMany({
    where: {
      purpose,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const candidate = candidates.find((entry) => {
    if (entry.usedAt) return false;
    return new Date(entry.expiresAt) > new Date();
  });

  if (!candidate) {
    return false;
  }

  const expectedBuffer = Buffer.from(candidate.code, "hex");
  const actualBuffer = Buffer.from(sha256Hash(code), "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);

  if (!isValid) {
    return false;
  }

  await prisma.otpVerification.update({
    where: { id: candidate.id },
    data: { usedAt: new Date() },
  });

  if (normalizedEmail) {
    await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: { emailVerifiedAt: new Date() },
    });
  }

  if (normalizedPhone) {
    await prisma.user.updateMany({
      where: { phone: normalizedPhone },
      data: { phoneVerifiedAt: new Date() },
    });
  }

  return true;
}

export async function sendEmailOtp(email: string, code: string) {
  if (!resendApiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[OTP DEBUG] Email OTP for ${email}: ${code}`);
    }
    return { sent: false, mode: "mock" as const };
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: resendFromEmail,
    to: [email],
    subject: "Your Cognive Academy verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="margin-bottom: 16px;">Your verification code</h2>
        <p style="font-size: 16px; margin-bottom: 18px;">Use the code below to verify your account.</p>
        <div style="padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center; font-size: 30px; letter-spacing: 6px; font-weight: 700; color: #111827;">
          ${code}
        </div>
        <p style="margin-top: 18px; font-size: 14px; color: #4b5563;">This code expires in 5 minutes.</p>
      </div>
    `,
  });

  return { sent: true, mode: "resend" as const };
}

export async function sendSmsOtp(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[OTP DEBUG] SMS OTP for ${phone}: ${code}`);
    }
    return { sent: false, mode: "mock" as const };
  }

  const client = twilio(accountSid, authToken);

  await client.messages.create({
    body: `Your Cognive Academy verification code is ${code}. It expires in 5 minutes.`,
    from: fromNumber,
    to: phone,
  });

  return { sent: true, mode: "twilio" as const };
}
