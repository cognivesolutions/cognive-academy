"use client";

export default function ContactCards() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 p-6 shadow">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-3 shadow">📱</div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Chat Support Number (WhatsApp)</h3>
            <div className="mt-2 text-slate-600">+91-9893181542</div>
            <div className="mt-1 text-sm text-slate-400">(Available 10 AM - 6PM IST)</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 p-6 shadow">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-3 shadow">✉️</div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Email Address</h3>
            <div className="mt-2 text-slate-600">support@growdataskills.com</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 shadow">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white p-3 shadow">📍</div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Location</h3>
            <div className="mt-2 text-slate-600">Gurgaon, Haryana</div>
          </div>
        </div>
      </div>
    </div>
  );
}
