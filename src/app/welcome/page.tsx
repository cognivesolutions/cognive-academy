import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white">
          ✓
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Welcome aboard</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Your account is ready</h1>
        <p className="mt-4 text-lg text-slate-600">
          You have successfully created your Cognive Academy account. Choose where you want to go next.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/" className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700">
            Explore courses
          </Link>
          <Link href="/login" className="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
