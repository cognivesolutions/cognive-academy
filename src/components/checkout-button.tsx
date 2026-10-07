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
  isLive?: boolean | null;
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
  const formatPrice = (value: number) => new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

  const ensureFinalizingScreen = () => {
    if (typeof document === "undefined") {
      return null;
    }

    let overlay = document.getElementById("payment-finalizing-screen") as HTMLDivElement | null;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "payment-finalizing-screen";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "99999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background = "rgba(2, 8, 18, 0.88)";
      overlay.style.padding = "24px";
      overlay.style.setProperty("backdrop-filter", "blur(8px)");
      overlay.style.setProperty("-webkit-backdrop-filter", "blur(8px)");
      overlay.style.pointerEvents = "all";
      overlay.style.visibility = "hidden";
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 120ms ease";
      overlay.innerHTML = `
        <div style="width:min(100%, 700px); min-height: 300px; border-radius: 26px; border: 1px solid rgba(45, 212, 191, 0.42); background: rgba(5, 22, 30, 0.86); box-shadow: 0 0 0 1px rgba(45, 212, 191, 0.08), 0 25px 60px rgba(10, 66, 95, 0.24), inset 0 0 42px rgba(45,212,191,0.04); display:flex; align-items:center; justify-content:center; padding: 12px 18px;">
          <div style="width: min(100%, 500px); text-align: center;">
            <div style="width: 58px; height: 58px; border-radius: 9999px; background: rgba(45, 212, 191, 0.14); border: 1px solid rgba(45, 212, 191, 0.18); margin: 0 auto 16px; display:flex; align-items:center; justify-content:center; color: #B8F9EA; font-size: 2rem; font-weight: 800; line-height: 1;">✓</div>
            <p style="margin: 0; letter-spacing: 0.24em; text-transform: uppercase; color: #9ae6d5; font-weight: 700; font-size: 11px; opacity: 0.96;">Payment confirmed</p>
            <h2 style="margin: 18px 0 12px; font-size: clamp(2.2rem, 2.5vw, 3.8rem); line-height: 0.94; letter-spacing: -0.075em; color: #f8fafc; font-weight: 900; font-family: Georgia, 'Times New Roman', serif;">Finalizing your enrollment...</h2>
            <p style="margin: 0; color: rgba(226, 232, 240, 0.8); font-size: 1rem; line-height: 1.55; font-weight: 500;">We are preparing your course access details. This will finish in a moment.</p>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    return overlay;
  };

  const showFinalizingScreen = () => {
    const overlay = ensureFinalizingScreen();
    if (!overlay) {
      return;
    }

    overlay.style.visibility = "visible";
    overlay.style.opacity = "1";
  };

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
          params.set("course_type", course.isLive ? "live" : "self-paced");

          const route = params.size > 0
            ? `/api/checkout/callback?${params.toString()}`
            : "/dashboard";

          showFinalizingScreen();
          window.location.replace(route);
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
        <div className="mt-5 space-y-2 rounded-[22px] border border-indigo-100/80 bg-white/70 p-3 shadow-[0_18px_32px_rgba(76,29,149,0.08)] backdrop-blur-xl dark:border-indigo-500/20 dark:bg-slate-900/70 dark:shadow-[0_18px_32px_rgba(15,23,42,0.45)]">
          <div className="flex gap-2">
            <input
              value={promoCodeInput}
              onChange={(event) => setPromoCodeInput(event.target.value)}
              placeholder="Enter promo code"
              className="w-full rounded-full border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 shadow-inner outline-none ring-0 placeholder:text-slate-400 transition focus:border-indigo-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleApplyPromoCode}
              className="rounded-full border border-white/20 bg-white/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-800 shadow-[0_10px_20px_rgba(168,85,247,0.16)] backdrop-blur-md transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/35 hover:shadow-[0_14px_24px_rgba(168,85,247,0.22)] dark:border-white/10 dark:bg-slate-900/35 dark:text-slate-100"
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
          {promoApplied ? (() => {
            const originalPrice = course.price;
            const discountedPrice = course.offerPrice ?? course.price;
            const discountPercent = originalPrice > discountedPrice
              ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
              : 0;

            return (
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <span className="line-through text-slate-400 dark:text-slate-500">
                  ₹{formatPrice(originalPrice)}
                </span>
                <span className="rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-300/80 via-green-300/80 to-lime-200/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-950 shadow-[0_10px_18px_rgba(16,185,129,0.18)] backdrop-blur-sm dark:border-emerald-400/30 dark:from-emerald-500/30 dark:via-green-500/25 dark:to-lime-400/20 dark:text-emerald-50">
                  Save {discountPercent}%
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  ₹{formatPrice(discountedPrice)}
                </span>
              </div>
            );
          })() : null}
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
