import React from "react";

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      title: "Website Design",
      tagline: "Modern, fast, and responsive",
      price: 899,
      unit: "one‑time",
      popular: true,
      features: [
        "Custom Figma → React build",
        "Mobile‑first, SEO‑ready",
        "1 month of support",
      ],
      cta: "Get a free quote",
    },
    {
      id: 2,
      title: "E‑Commerce Setup",
      tagline: "Sell online in days, not weeks",
      price: 1299,
      unit: "starter package",
      features: [
        "Product catalog & checkout",
        "Payments & invoices",
        "Analytics dashboard",
      ],
      cta: "Launch my store",
    },
    {
      id: 3,
      title: "Growth Marketing",
      tagline: "SEO + Ads that actually convert",
      price: 499,
      unit: "/ month",
      features: [
        "Keyword & content plan",
        "Google/Facebook Ads setup",
        "Monthly reports",
      ],
      cta: "Book a call",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-8">
        <div className="text-center">

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Sell more with a <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">clean, fast</span> website
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Pick a package below or mix & match. Transparent pricing, real results.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {s.popular && (
                <span className="absolute -top-2 right-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">Best Seller</span>
              )}

              <header className="mb-4">
                <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.tagline}</p>
              </header>

              <Price price={s.price} unit={s.unit} />

              <ul className="mt-5 space-y-2 text-sm">
                {s.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-3">
                <button className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  {s.cta}
                </button>
                <button className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Learn more
                </button>
              </div>

              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 ring-4 ring-blue-500/20 transition group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Price({ price, unit }) {
  return (
    <div className="mt-2 flex items-end gap-2">
      <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">${price}</span>
      <span className="pb-1 text-sm text-slate-500">{unit}</span>
    </div>
  );
}

// Minimal inline icons (no external deps)
function Check() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="mt-0.5 h-5 w-5 text-green-600"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Dot() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3.5 w-3.5 text-blue-600"
      aria-hidden
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}
