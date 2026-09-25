import Link from "next/link";

export default function CorporateTrainingPage() {
  return (
    <main className="flex min-h-[calc(100vh-180px)] items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#f5f3ff_50%,_#eef7ff_100%)] px-6 py-16">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white/80 p-8 text-center shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 text-2xl font-black text-white shadow-[0_16px_30px_rgba(79,70,229,0.24)]">
          !
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
          Coming soon
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Corporate training is on the way.
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
          We&apos;re preparing tailored learning programs for teams that want practical upskilling and stronger business outcomes.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(79,70,229,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(79,70,229,0.32)]"
          >
            Go to home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Browse courses
          </Link>
        </div>
      </div>
    </main>
  );
}
