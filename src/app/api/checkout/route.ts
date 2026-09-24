import crypto from "node:crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { prisma } from "@/lib/prisma";

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex"),
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = rawBody ? JSON.parse(rawBody) : {};

    if (payload?.source === "webhook") {
      const signature = request.headers.get("x-razorpay-signature");

      if (!verifyWebhookSignature(rawBody, signature)) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }

      const payment = payload.payload?.payment?.entity;
      const order = payload.payload?.order?.entity;
      const courseId = payment?.notes?.courseId;
      const userId = payment?.notes?.userId;

      if (payload.event === "payment.captured" && courseId && userId) {
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        });

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId,
              courseId,
              orderId: order?.id ?? null,
              accessGranted: true,
              grantedAt: new Date(),
            },
          });
        }

        await prisma.order.updateMany({
          where: {
            razorpayOrderId: order?.id,
          },
          data: {
            status: "PAID",
            razorpayPaymentId: payment?.id,
            razorpaySignature: signature ?? null,
          },
        });
      }

      return NextResponse.json({ success: true, received: true });
    }

    const { courseId, userId, amount, currency = "INR" } = payload ?? {};

    if (!courseId) {
      return NextResponse.json({ success: false, message: "courseId is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    if (!razorpay) {
      return NextResponse.json(
        { success: false, message: "Razorpay credentials are not configured" },
        { status: 500 },
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
      },
    });

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    const safeAmount = Number(amount ?? course.price ?? 0);
    const amountInPaise = Math.round(safeAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `course_${course.id}_${Date.now()}`,
      notes: {
        courseId: course.id,
        courseTitle: course.title,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Checkout route failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create Razorpay order" },
      { status: 500 },
    );
  }
}
