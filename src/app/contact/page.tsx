import ContactForm from "./components/contact-form";
import ContactCards from "./components/contact-cards";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with us",
};

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(147,197,253,0.12),_transparent_36%),linear-gradient(135deg,_#f8fbff_0%,_#fbf6ff_100%)] py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Contact</div>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Get in touch — we're happy to help</h1>
            <p className="mt-2 text-slate-600">Fill the form and our representative will contact you shortly.</p>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl gap-8">
          <ContactForm />
          <ContactCards />
        </div>
      </div>
    </div>
  );
}
