const highlights = [
  { value: "500+", label: "Learners supported" },
  { value: "4.9/5", label: "Average learner experience" },
  { value: "12+", label: "Career pathways" },
  { value: "100%", label: "Project-led learning" },
];

export default function AboutHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map((item) => (
        <div
          key={item.label}
          className="rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:bg-white hover:shadow-[0_28px_64px_rgba(15,23,42,0.12),0_0_0_1px_rgba(99,102,241,0.06)]"
        >
          <div className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.value}</div>
          <div className="mt-2 text-sm font-medium text-slate-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
