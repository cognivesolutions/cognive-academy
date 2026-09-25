import ContactForm from "./components/contact-form";
import ContactCards from "./components/contact-cards";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with us",
};

export default async function ContactPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.12),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#faf5ff_35%,_#f8fbff_100%)] py-4 md:py-6 lg:min-h-[calc(100vh-180px)] lg:py-5">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 max-w-3xl text-left">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-700">Contact</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Get in touch — we&apos;re happy to help</h1>
          <p className="mt-3 text-lg text-slate-600">Have a question or need assistance?</p>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.9fr)] lg:gap-6">
          <div className="lg:-mt-1">
            <ContactCards />
          </div>
          <div className="lg:pt-1">
            <ContactForm courses={courses} />
          </div>
        </div>
      </div>
    </div>
  );
}
