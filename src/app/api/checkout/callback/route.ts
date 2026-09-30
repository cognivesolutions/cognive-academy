import Razorpay from "razorpay";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const signature = searchParams.get("signature");
  const courseSlug = searchParams.get("course_slug") ?? "";

  if (paymentId && razorpay) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      const courseId = payment?.notes?.courseId as string | undefined;
      const userId = payment?.notes?.userId as string | undefined;

      if (courseId && userId) {
        const orderRecord = await prisma.order.findFirst({
          where: {
            userId,
            courseId,
            OR: [
              { razorpayOrderId: orderId ?? payment.order_id ?? null },
              { razorpayPaymentId: paymentId },
            ],
          },
        });

        if (orderRecord) {
          await prisma.order.update({
            where: { id: orderRecord.id },
            data: {
              status: "PAID",
              razorpayPaymentId: paymentId,
              razorpaySignature: signature ?? null,
            },
          });
        } else {
          const amountInRupees = Number(payment.amount ?? 0) / 100;
          const createdOrder = await prisma.order.create({
            data: {
              userId,
              courseId,
              amount: amountInRupees,
              currency: payment.currency ?? "INR",
              status: "PAID",
              paymentProvider: "RAZORPAY",
              razorpayOrderId: orderId ?? payment.order_id ?? null,
              razorpayPaymentId: paymentId,
              razorpaySignature: signature ?? null,
            },
          });

          await prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
            update: {
              orderId: createdOrder.id,
              accessGranted: true,
              grantedAt: new Date(),
            },
            create: {
              userId,
              courseId,
              orderId: createdOrder.id,
              accessGranted: true,
              grantedAt: new Date(),
            },
          });
        }

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
              orderId: orderRecord?.id ?? null,
              accessGranted: true,
              grantedAt: new Date(),
            },
          });
        }
      }
    } catch (error) {
      console.error("Checkout callback confirmation failed:", error);
    }
  }

  const target = new URL("/checkout/success", request.url);

  if (paymentId) {
    target.searchParams.set("payment_id", paymentId);
  }

  if (courseSlug) {
    target.searchParams.set("course_slug", courseSlug);
  }

  return NextResponse.redirect(target);
}
