import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";
import youtubeIcon from "@/../assets/images/icons/youtube.png";
import linkedinIcon from "@/../assets/images/icons/linkedin.png";
import instagramIcon from "@/../assets/images/icons/instagram.png";
import telegramIcon from "@/../assets/images/icons/telegram.png";
import discordIcon from "@/../assets/images/icons/discord.png";

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-sm font-black text-white shadow-lg shadow-indigo-900/40 ring-4 ring-indigo-500/20">C</div>
              <div className="leading-none">
                <div className="text-base font-bold tracking-tight text-white">{SITE.name}</div>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Career-focused learning for analysts, builders, and business professionals who want practical skills that translate into real work.
            </p>

            <div className="mt-6 flex items-center gap-3.5">
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <Image src={youtubeIcon} alt="YouTube" width={36} height={36} className="h-full w-full rounded-full object-cover" />
              </a>

              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <Image src={linkedinIcon} alt="LinkedIn" width={36} height={36} className="h-full w-full rounded-full object-cover" />
              </a>

              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <Image src={instagramIcon} alt="Instagram" width={36} height={36} className="h-full w-full rounded-full object-cover scale-[1.25]" />
              </a>

              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <Image src={telegramIcon} alt="Telegram" width={36} height={36} className="h-full w-full rounded-full object-cover" />
              </a>

              <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <Image src={discordIcon} alt="Discord" width={36} height={36} className="h-full w-full rounded-full object-cover scale-[1.28]" />
              </a>

              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/70 transition-transform duration-200 hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-slate-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" aria-hidden>
                  <rect width="24" height="24" rx="12" fill="#000000" />
                  <path d="M17.2 4h2.4l-5.3 6.1L20 20h-4.8l-3.8-5.6L7.2 20H4.8l5.7-6.5L4 4h4.9l3.4 5.1L17.2 4Zm-.9 14.2h1.3L8.1 5.7H6.7l9.6 12.5Z" fill="#fff" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Courses links">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Courses</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><Link href="/courses/sql-for-analytics" className="hover:text-white">Data Analytics</Link></li>
              <li><Link href="/courses/python-for-data-tasks" className="hover:text-white">Python</Link></li>
              <li><Link href="/courses/sql-for-analytics" className="hover:text-white">SQL</Link></li>
              <li><Link href="/courses/power-bi-dashboarding" className="hover:text-white">Power BI</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><Link href="/mentorship" className="hover:text-white">1:1 Mentorship</Link></li>
              <li><Link href="/mock-interviews" className="hover:text-white">Mock Interviews</Link></li>
              <li><Link href="/corporate-training" className="hover:text-white">Corporate Training</Link></li>
            </ul>
          </div>

          <nav aria-label="Resources links">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Resources</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li><Link href="/interview-experiences" className="hover:text-white">Interview Experiences</Link></li>
              <li><Link href="/success-stories" className="hover:text-white">Success Stories</Link></li>
              <li><Link href="/tech-blog" className="hover:text-white">Tech Blog</Link></li>
              <li><Link href="/resume-analyzer" className="hover:text-white">Resume Analyzer</Link></li>
            </ul>
          </nav>

          <nav aria-label="Contact us links">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Contact Us</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                  <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.55 3.5.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C11.3 21 3 12.7 3 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.19 2.4.55 3.5a1 1 0 0 1-.24 1l-2.2 2.2Z"/>
                </svg>
                <a href="tel:+917839649747" className="hover:text-white">+91-78396 49747</a>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                  <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.45-.5 6.3 5.08a1 1 0 0 0 1.25 0l6.3-5.08H5.45Z"/>
                </svg>
                <a href="mailto:cogniveacademy@gmail.com" className="hover:text-white">cogniveacademy@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-400" aria-hidden>
                  <path d="M12 2.75a7.25 7.25 0 0 1 7.25 7.25c0 4.48-5.13 10.77-6.17 11.93a1 1 0 0 1-1.58 0C9.88 20.77 4.75 14.48 4.75 10A7.25 7.25 0 0 1 12 2.75Zm0 4.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
                </svg>
                <a href="https://maps.google.com/?q=New+Delhi+India" target="_blank" rel="noopener noreferrer" className="hover:text-white">New Delhi, India</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex sm:items-center sm:justify-between">
          <p className="mb-3 sm:mb-0">© {SITE.footerYear} {SITE.name}. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/refund" className="transition-colors hover:text-white">Refund Policy</Link>
            <Link href="/faq" className="transition-colors hover:text-white">FAQ&apos;s</Link>
            <Link href="/support" className="transition-colors hover:text-white">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
