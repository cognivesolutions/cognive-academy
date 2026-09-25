const values = [
  {
    title: "Career-first learning",
    description: "Every program is built around applied tasks, portfolio-ready work, and examples that reflect how teams actually operate.",
  },
  {
    title: "Clear progression",
    description: "We break complex topics into manageable steps so learners build skills steadily, confidently, and with measurable momentum.",
  },
  {
    title: "Mentor guidance",
    description: "Our team helps learners stay focused, get unstuck faster, and move forward with practical feedback that improves outcomes.",
  },
  {
    title: "Real-world relevance",
    description: "We emphasize the tools, workflows, and thinking patterns that matter in interviews, projects, and high-performance teams.",
  },
];

export default function AboutValues() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {values.map((value, index) => (
        <article
          key={value.title}
          className="group flex h-full flex-col rounded-[28px] border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-300/80 hover:bg-slate-800/95 hover:shadow-[0_26px_64px_rgba(79,70,229,0.22),0_0_0_1px_rgba(129,140,248,0.16)]"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-[0_12px_26px_rgba(99,102,241,0.28)]">
            0{index + 1}
          </div>
          <h3 className="text-xl font-bold text-white">{value.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{value.description}</p>
        </article>
      ))}
    </div>
  );
}
