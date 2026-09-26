import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.3)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white">
          ✓
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Welcome aboard</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">Your account is ready</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          You have successfully created your Cognive Academy account. Choose where you want to go next.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/courses#course-results" className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500">
            Explore courses
          </Link>
          <Link href="/login" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
