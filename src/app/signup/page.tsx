"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+()\-\s]{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");

  function validateName(value: string) {
    const trimmedValue = value.trim();
    return trimmedValue.length >= 2 && /[A-Za-z]/.test(trimmedValue);
  }

  function validateEmailAddress(value: string) {
    return emailRegex.test(value.trim());
  }

  function validatePhoneNumber(value: string) {
    const trimmedValue = value.trim();
    return phoneRegex.test(trimmedValue) && trimmedValue.replace(/\D/g, "").length >= 10;
  }

  function validatePassword(value: string) {
    return passwordRegex.test(value);
  }

  async function checkEmailAvailability(value: string) {
    const trimmedValue = value.trim().toLowerCase();

    if (!validateEmailAddress(trimmedValue)) {
      setEmailError("");
      return true;
    }

    setEmailChecking(true);

    try {
      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(trimmedValue)}`);
      const data = await response.json();
      const isDuplicate = Boolean(data?.exists);

      setEmailError(isDuplicate ? "An account with this email already exists." : "");
      return !isDuplicate;
    } catch (_error) {
      setEmailError("");
      return true;
    } finally {
      setEmailChecking(false);
    }
  }

  async function checkPhoneAvailability(value: string) {
    const trimmedValue = value.trim();

    if (!validatePhoneNumber(trimmedValue)) {
      setPhoneError("");
      return true;
    }

    setPhoneChecking(true);

    try {
      const response = await fetch(`/api/users/check-phone?phone=${encodeURIComponent(trimmedValue)}`);
      const data = await response.json();
      const isDuplicate = Boolean(data?.exists);

      setPhoneError(isDuplicate ? "An account with this mobile number already exists." : "");
      return !isDuplicate;
    } catch (_error) {
      setPhoneError("");
      return true;
    } finally {
      setPhoneChecking(false);
    }
  }

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Mix of letters, numbers, and symbols",
      valid:
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password),
    },
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!validateName(name)) {
      setError("Please enter a valid full name with at least 2 characters and letters.");
      setLoading(false);
      return;
    }

    if (!validateEmailAddress(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const emailAvailable = await checkEmailAvailability(email);

    if (!emailAvailable) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid mobile number with at least 10 digits.");
      setLoading(false);
      return;
    }

    const phoneAvailable = await checkPhoneAvailability(phone);

    if (!phoneAvailable) {
      setError("An account with this mobile number already exists.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message ?? "Unable to create account.");
      }

      router.push("/welcome");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_45%,_#eef7ff_100%)] px-6 py-12 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#020817_0%,_#0f172a_35%,_#111827_100%)]">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white/90 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-9 dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-[0_28px_70px_rgba(2,6,23,0.52)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-lg font-black text-white shadow-lg shadow-indigo-200 dark:shadow-[0_16px_28px_rgba(99,102,241,0.35)]">
            C
          </div>
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">Create account</p>
        <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">Join Cognive Academy</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const nextEmail = e.target.value;
                setEmail(nextEmail);

                if (!nextEmail.trim()) {
                  setEmailError("");
                  return;
                }

                if (!validateEmailAddress(nextEmail)) {
                  setEmailError("");
                  return;
                }

                void checkEmailAvailability(nextEmail);
              }}
              onBlur={() => {
                if (email.trim()) {
                  void checkEmailAvailability(email);
                }
              }}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
              required
            />
            {emailChecking ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Checking email...</p>
            ) : null}
            {emailError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">{emailError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Mobile number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const nextPhone = e.target.value;
                setPhone(nextPhone);

                if (!nextPhone.trim()) {
                  setPhoneError("");
                  return;
                }

                if (!validatePhoneNumber(nextPhone)) {
                  setPhoneError("");
                  return;
                }

                void checkPhoneAvailability(nextPhone);
              }}
              onBlur={() => {
                if (phone.trim()) {
                  void checkPhoneAvailability(phone);
                }
              }}
              placeholder="Enter your mobile number"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
              required
            />
            {phoneChecking ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Checking mobile number...</p>
            ) : null}
            {phoneError ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">{phoneError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-11 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
                minLength={8}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 ? (
              <div className="mt-2 grid gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-950/40">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 text-[11px]">
                    <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold ${check.valid ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-500"}`}>
                      {check.valid ? "✓" : "•"}
                    </span>
                    <span className={check.valid ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 font-semibold text-white shadow-[0_16px_35px_rgba(79,70,229,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-[0_16px_35px_rgba(99,102,241,0.36)]"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Already have an account? {" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
