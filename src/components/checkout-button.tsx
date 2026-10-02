"use client";

import { useState } from "react";
import { loadRazorpayScript } from "./razorpay-script";

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
  offerPrice?: number | null;
  isPromotional?: boolean | null;
  currency: string;
  promoCode?: string | null;
};

export default function CheckoutButton({
  course,
  userId,
  isAuthenticated,
  buttonLabel = "Buy Now",
}: {
  course: CheckoutCourse;
  userId: string;
  isAuthenticated: boolean;
  buttonLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const canUsePromo = Boolean(course.isPromotional && course.promoCode);
  const finalAmount = promoApplied && course.offerPrice ? course.offerPrice : course.price;

  if (!isAuthenticated) {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/courses/${course.slug}`)}`;

    return (
      <a
        href={loginUrl}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(79,70,229,0.42)]"
      >
        Login to enroll
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
          amount: finalAmount,
          currency: course.currency,
          promoCode: promoApplied ? course.promoCode ?? "" : "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.order || !data?.keyId) {
        throw new Error(data?.message ?? "Unable to start checkout");
      }

      const { order, keyId } = data;
      await loadRazorpayScript();
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
        handler: function handleSuccess(response: {
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          const params = new URLSearchParams();

          if (response.razorpay_payment_id) {
            params.set("payment_id", response.razorpay_payment_id);
          }

          if (response.razorpay_order_id) {
            params.set("order_id", response.razorpay_order_id);
          }

          if (response.razorpay_signature) {
            params.set("signature", response.razorpay_signature);
          }

          params.set("course_slug", course.slug);

          const route = params.size > 0
            ? `/api/checkout/callback?${params.toString()}`
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

  const handleApplyPromoCode = () => {
    if (!canUsePromo) {
      setPromoError("This course does not have an active promo code.");
      return;
    }

    const normalizedInput = promoCodeInput.trim().toUpperCase();
    const normalizedCourseCode = (course.promoCode ?? "").trim().toUpperCase();

    if (!normalizedInput) {
      setPromoError("Enter a promo code to continue.");
      return;
    }

    if (normalizedInput !== normalizedCourseCode) {
      setPromoError("That promo code is invalid for this course.");
      setPromoApplied(false);
      return;
    }

    setPromoError(null);
    setPromoApplied(true);
  };

  return (
    <>
      {canUsePromo ? (
        <div className="mt-5 space-y-2">
          <div className="flex gap-2">
            <input
              value={promoCodeInput}
              onChange={(event) => setPromoCodeInput(event.target.value)}
              placeholder="Enter promo code"
              className="w-full rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleApplyPromoCode}
              className="rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Apply
            </button>
          </div>
          {promoApplied ? (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">
              Promo applied: {course.promoCode}
            </p>
          ) : null}
          {promoError ? (
            <p className="text-xs font-medium text-red-600 dark:text-red-300">{promoError}</p>
          ) : null}
          {promoApplied ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Offer price: ₹{(course.offerPrice ?? course.price).toLocaleString("en-IN")}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_24px_54px_rgba(79,70,229,0.42)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Preparing checkout..." : buttonLabel}
      </button>
    </>
  );
}
