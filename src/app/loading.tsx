export default function Loading() {
  return (
    <main className="min-h-[50vh] bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-32 rounded-full bg-slate-200" />
          <div className="h-12 w-full max-w-xl rounded-xl bg-slate-200" />
          <div className="h-12 w-full max-w-md rounded-xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-48 rounded-3xl bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />
            <div className="h-48 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
