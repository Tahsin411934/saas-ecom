import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ContentPage as ContentPageData } from "@/lib/content-pages";

interface ContactDetails {
  email: string;
  phone: string;
  address: string;
}

export default function ContentPage({
  page,
  contact,
}: {
  page: ContentPageData;
  contact: ContactDetails;
}) {
  return (
    <main className="min-h-[60vh] bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-slate-700">{page.title}</span>
        </nav>

        <header className="border-b border-slate-100 pb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{page.intro}</p>
        </header>

        <div className="divide-y divide-slate-100">
          {page.sections.map((section) => (
            <section key={section.heading} className="py-7 first:pt-7">
              <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.bullets && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 sm:text-base">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="mt-2 rounded-xl bg-slate-50 p-5 sm:p-6" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-lg font-semibold text-slate-900">Need more help?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Contact our customer service team and include your order number when your question is about a purchase.</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-2 hover:text-[var(--color-primary)]">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{contact.phone}</span>
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-start gap-2 hover:text-[var(--color-primary)]">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{contact.email}</span>
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{contact.address}</span>
            </div>
          </div>
          {page.slug !== "contact" && (
            <Link href="/contact" className="mt-5 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Contact Us
            </Link>
          )}
        </aside>
      </article>
    </main>
  );
}
