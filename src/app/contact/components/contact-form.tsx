"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", occupation: "", course: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("contact submit", form);
    alert("Thanks! We'll get back to you soon.");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full">EDUCATION FOR EVERYONE</div>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Fill out the form below, and one of our friendly representatives will give you a call as soon as possible.</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input name="email" value={form.email} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Skill/Occupation</label>
          <input name="occupation" value={form.occupation} onChange={handleChange} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Courses</label>
          <select name="course" value={form.course} onChange={handleChange} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">Select Course</option>
            <option>Data Analytics</option>
            <option>Python</option>
            <option>SQL</option>
            <option>Power BI</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Message *</label>
          <textarea name="message" value={form.message} onChange={handleChange} required rows={6} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" className="rounded-md bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-3 text-white font-semibold shadow">Submit</button>
      </div>
    </form>
  );
}
