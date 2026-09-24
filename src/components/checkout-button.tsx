"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type CheckoutCourse = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
};

export default function CheckoutButton({
  course,
  userId,
  isAuthenticated,
}: {
  course: CheckoutCourse;
  userId: string;
  isAuthenticated: boolean;
}) {
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/courses/${course.slug}`)}`;

    return (
      <a
        href={loginUrl}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-700"
      >
        Login to buy
      </a>
    );
  }

  async function handleCheckout() {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          userId,
          amount: course.price,
          currency: course.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.order || !data?.keyId) {
        throw new Error(data?.message ?? "Unable to start checkout");
      }

      const { order, keyId } = data;
      const RazorpayCtor = window.Razorpay;

      if (!RazorpayCtor) {
        throw new Error("Razorpay checkout is not available right now.");
      }

      const razorpay = new RazorpayCtor({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Cognive Academy",
        description: course.title,
        order_id: order.id,
        handler: function handleSuccess(response: { razorpay_payment_id?: string }) {
          const paymentId = response.razorpay_payment_id ?? "";
          const route = paymentId
            ? `/api/checkout/callback?payment_id=${encodeURIComponent(paymentId)}`
            : "/dashboard";

          window.location.href = route;
        },
        theme: {
          color: "#4f46e5",
        },
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className="mt-6 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Preparing checkout..." : "Buy Now"}
    </button>
  );
}
