"use client";

import Image from "next/image";

import whatsappIcon from "../../../../assets/images/icons/whatsapp.png";
import mailIcon from "../../../../assets/images/icons/mail.png";
import locationIcon from "../../../../assets/images/icons/location.png";

const contactItems = [
  {
    iconSrc: whatsappIcon,
    title: "Chat Support Number",
    value: "+91-78396 49747",
    detail: "(Available 10 AM - 6 PM IST)",
    badge: "bg-[#eef5ea] shadow-[0_14px_28px_rgba(34,197,94,0.12)]",
    text: "text-emerald-700",
    href: "https://wa.me/917839649747",
    target: "_blank",
  },
  {
    iconSrc: mailIcon,
    title: "Email Address",
    value: "cogniveacademy@gmail.com",
    detail: "(We usually reply within 24 hours)",
    badge: "bg-[#ebf1ff] shadow-[0_14px_28px_rgba(59,130,246,0.12)]",
    text: "text-blue-700",
    href: "mailto:cogniveacademy@gmail.com",
    target: "_self",
  },
  {
    iconSrc: locationIcon,
    title: "Location",
    value: "New Delhi, India",
    detail: "(Available for online & hybrid support)",
    badge: "bg-[#fff2dd] shadow-[0_14px_28px_rgba(249,115,22,0.12)]",
    text: "text-amber-700",
    href: "https://maps.google.com/?q=New+Delhi,+India",
    target: "_blank",
  },
];

export default function ContactCards() {
  return (
    <div className="grid gap-3 lg:pt-1">
      {contactItems.map((item) => (
        <a
          key={item.title}
          href={item.href}
          target={item.target}
          rel={item.target === "_blank" ? "noreferrer" : undefined}
          className="group block rounded-[26px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_42px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_26px_54px_rgba(15,23,42,0.09)]"
        >
          <div className="flex items-center gap-3.5">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] ${item.badge}`}>
              <Image src={item.iconSrc} alt={item.title} width={48} height={48} className="h-8 w-8 object-contain drop-shadow-[0_3px_8px_rgba(15,23,42,0.08)]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-slate-900">{item.title}</h3>
              <div className={`mt-1 text-sm font-semibold ${item.text} transition-colors duration-200`}>{item.value}</div>
              <div className="mt-1 text-[11px] text-slate-500 transition-colors duration-200 group-hover:text-slate-600">{item.detail}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
