import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { settingsService } from "@/services/settings.service";

interface SocialLink {
  name: string;
  href: string;
  svg: React.ReactNode;
}

function getSocialLinks(data: Record<string, string | null>): SocialLink[] {
  const fb = data?.facebook_url;
  const tw = data?.twitter_url;
  const ig = data?.instagram_url;
  const yt = data?.youtube_url;

  return [
    {
      name: "Facebook",
      href: fb && fb !== "#" ? fb : "#",
      svg: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: tw && tw !== "#" ? tw : "#",
      svg: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: ig && ig !== "#" ? ig : "#",
      svg: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.83 2.012 9.165 2 12.315 2zm0 1.802c-2.36 0-2.64.009-3.573.052-1.008.046-1.558.207-1.923.344-.484.184-.829.403-1.19.765-.362.362-.581.707-.765 1.19-.137.365-.298.915-.344 1.923-.043.933-.052 1.213-.052 3.573s.009 2.64.052 3.573c.046 1.008.207 1.558.344 1.923.184.484.403.829.765 1.19.362.362.707.581 1.19.765.365.137.915.298 1.923.344.933.043 1.213.052 3.573.052s2.64-.009 3.573-.052c1.008-.046 1.558-.207 1.923-.344.484-.184.829-.403 1.19-.765.362-.362.581-.707.765-1.19.137-.365.298-.915.344-1.923.043-.933.052-1.213.052-3.573s-.009-2.64-.052-3.573c-.046-1.008-.207-1.558-.344-1.923a3.097 3.097 0 00-.765-1.19 3.097 3.097 0 00-1.19-.765c-.365-.137-.915-.298-1.923-.344-.933-.043-1.213-.052-3.573-.052zM8.334 12a3.666 3.666 0 117.332 0 3.666 3.666 0 01-7.332 0zm9.468-3.834a.858.858 0 11-1.716 0 .858.858 0 011.716 0zM12 9.868a2.132 2.132 0 100 4.264 2.132 2.132 0 000-4.264z" />
        </svg>
      ),
    },
    {
      name: "Youtube",
      href: yt && yt !== "#" ? yt : "#",
      svg: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];
}

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { name: "All Products", href: "/shop" },
      { name: "New Arrivals", href: "/shop?sort=newest" },
      { name: "Best Sellers", href: "/shop?sort=bestsellers" },
      { name: "Sale", href: "/shop?sort=sale" },
      { name: "Categories", href: "/categories" },
    ],
  },
  customerService: {
    title: "Customer Service",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Track Order", href: "/order-status" },
      { name: "Shipping Info", href: "/shipping-info" },
      { name: "Returns & Exchanges", href: "/returns" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Blog", href: "/blog" },
    ],
  },
};

const paymentMethods = [
  { name: "Visa" },
  { name: "Mastercard" },
  { name: "Amex" },
  { name: "PayPal" },
  { name: "Cash on Delivery" },
];

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  let settings: Record<string, string | null> = {};

  try {
    const res = await settingsService.getAll();
    if (res.success) {
      settings = res.data;
    }
  } catch {
    // API unavailable - use defaults
  }

  const socialLinks = getSocialLinks(settings);
  const siteName = settings?.site_name || "OneHaatbd";
  const phone = settings?.phone || "+880 123-456-7890";
  const email = settings?.email || "support@onehaatbd.com";
  const address = settings?.address || "123 Commerce Ave, Dhaka, Bangladesh";

  return (
    <footer className="w-full bg-[#0F1115] text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-0.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {siteName}
              </span>
              <span className="text-3xl font-bold text-[var(--color-primary)]">.</span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              {settings?.site_description || "Your premium online shopping destination. Discover top-quality products at unbeatable prices with fast, reliable delivery."}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <a href={`tel:${phone}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <a href={`mailto:${email}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {email}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all duration-200"
                  aria-label={`Follow us on ${social.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} {siteName}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">We Accept:</span>
            <div className="flex items-center gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex items-center gap-1 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-gray-400"
                  title={method.name}
                >
                  <CreditCard className="h-3 w-3" />
                  <span className="hidden sm:inline">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}