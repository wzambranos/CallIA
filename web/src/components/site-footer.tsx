import Link from "next/link";

const social = [
  { name: "LinkedIn", href: "#", icon: LinkedInIcon },
  { name: "Facebook", href: "#", icon: FacebookIcon },
  { name: "TikTok", href: "#", icon: TikTokIcon },
  { name: "X", href: "#", icon: XIcon },
  { name: "YouTube", href: "#", icon: YouTubeIcon },
  { name: "Instagram", href: "#", icon: InstagramIcon },
];

const columns = [
  [
    { href: "/presentacion", label: "Producto" },
    { href: "/precios", label: "Precios" },
    { href: "/contacto", label: "Contacto" },
  ],
  [
    { href: "/entrar", label: "Entrar" },
    { href: "/registro", label: "Crear cuenta" },
  ],
];

export function SiteFooter() {
  return (
    <footer className="bg-sidebar text-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <ul className="flex items-center gap-5">
              {social.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    aria-label={item.name}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    <item.icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm font-medium">
            {columns.map((group, index) => (
              <ul key={index} className="space-y-4">
                {group.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-white/80">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </nav>
        </div>
        <p className="mt-16 text-xs text-sidebar-muted">© Copyright 2026 CustomerHub</p>
      </div>
    </footer>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 1 2.5 6a2.5 2.5 0 0 1 2.48-2.5ZM3 8.75h3.96V21H3V8.75ZM9.75 8.75H13.5v1.67h.05c.52-.98 1.8-2.02 3.7-2.02 3.96 0 4.7 2.6 4.7 6V21H18V15.3c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.19 1.48-2.19 3V21H9.75V8.75Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M14.5 8.5V6.75c0-.7.46-.86.78-.86H17V3h-2.72C11.4 3 10.5 5.02 10.5 6.58V8.5H8v3h2.5V21h4v-9.5h2.66l.34-3H14.5Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M19 8.15A6.6 6.6 0 0 1 15.2 7V16a5 5 0 1 1-5-5c.28 0 .55.03.82.08v2.56A2.5 2.5 0 1 0 13.2 16V3h2.4a6.6 6.6 0 0 0 3.4 3.12V8.15Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M14.7 10.4 21 3h-1.9l-5.5 6.4L9.3 3H3.2l6.7 9.8L3 21h1.9l5.9-6.8L14.6 21h6.1l-6-10.6Zm-2.1 2.4-.7-1-5.5-7.8h2.4l4.4 6.3.7 1 5.8 8.2h-2.4l-4.7-6.7Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M23 12.2s0-3.2-.4-4.6c-.2-.8-.9-1.5-1.7-1.7C19.3 5.5 12 5.5 12 5.5s-7.3 0-8.9.4c-.8.2-1.5.9-1.7 1.7C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.8.9 1.5 1.7 1.7 1.6.4 8.9.4 8.9.4s7.3 0 8.9-.4c.8-.2 1.5-.9 1.7-1.7.4-1.4.4-4.6.4-4.6ZM9.8 15.6V8.8l6.1 3.4-6.1 3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm8 1.8H8A3.2 3.2 0 0 0 4.8 8v8A3.2 3.2 0 0 0 8 19.2h8A3.2 3.2 0 0 0 19.2 16V8A3.2 3.2 0 0 0 16 4.8ZM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Zm4.7-2.95a.9.9 0 1 1-.9.9.9.9 0 0 1 .9-.9Z" />
    </svg>
  );
}
