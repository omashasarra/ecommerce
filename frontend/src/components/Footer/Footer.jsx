// components/Footer.jsx
import React from "react";
import { FaMobileAlt } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaLinkedin, FaLocationArrow } from "react-icons/fa6";

export default function Footer() {
  const [data, setData] = React.useState(null);   // single doc
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let live = true;

    (async () => {
      try {
        const res = await fetch("/api/footer", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // json is the active footer doc (or fallback object)
        if (live) setData(json || null);
      } catch (e) {
        if (live) setError(e.message || "Failed to load");
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  // Fallbacks (only used after loading is false)
  const companyName = data?.companyName || "Eshop";
  const aboutText = data?.aboutText || "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss";
  const madeBy = data?.madeBy || "Made by Sara";
  const address = data?.address || "Nabatieh, Hasbaya";
  const phone = data?.phone || "+ 961 123 456";
  const socials = data?.socials || {};
  const importantLinks = (data?.importantLinks || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const quickLinks = (data?.quickLinks || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="dark:bg-gray-950">
      <div className="container">
        {/* loading / error states like Hero.jsx */}
        {loading && <div style={{ padding: 12 }}>Loading…</div>}
        {error && (
          <div style={{ padding: 12, color: "red" }}>
            Error: {error}
          </div>
        )}

        {/* Render only when we have finished loading and there's no error */}
        {!loading && !error && (
          <div className="grid md:grid-cols-3 pb-20 pt-5">
            {/* company details */}
            <div className="py-8 px-4">
              <a
                href="#"
                className="text-primary font-semibold tracking-widest text-2xl uppercase sm:text-3xl "
              >
                {companyName}
              </a>
              <p className="text-gray-600 dark:text-white/70 lg:pr-24 pt-3">
                {aboutText}
              </p>
              <p className="text-gray-500 mt-4">{madeBy}</p>
            </div>

            {/* Footer links */}
            <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 md:pl-10">
              <div className="py-8 px-4">
                <h1 className="text-xl font-bold sm:text-left mb-3">Important Links</h1>
                <ul className="space-y-3">
                  {importantLinks.map((d, i) => (
                    <li key={i}>
                      <a
                        href={d.link}
                        className="text-gray-600 dark:text-gray-400 hover:dark:text-white hover:text-black duration-300"
                      >
                        {d.title}
                      </a>
                    </li>
                  ))}
                  {importantLinks.length === 0 && (
                    <li className="text-sm text-gray-500 dark:text-slate-400">No links</li>
                  )}
                </ul>
              </div>

              <div className="py-8 px-4">
                <h1 className="text-xl font-bold sm:text-left mb-3">Quick Links</h1>
                <ul className="space-y-3">
                  {quickLinks.map((d, i) => (
                    <li key={i}>
                      <a
                        href={d.link}
                        className="text-gray-600 dark:text-gray-400 hover:dark:text-white hover:text-black duration-300"
                      >
                        {d.title}
                      </a>
                    </li>
                  ))}
                  {quickLinks.length === 0 && (
                    <li className="text-sm text-gray-500 dark:text-slate-400">No links</li>
                  )}
                </ul>
              </div>

              {/* Company Address */}
              <div className="py-8 px-4 col-span-2 sm:col-auto">
                <h1 className="text-xl font-bold sm:text-left mb-3">Adress </h1>
                <div>
                  <div className="flex items-center gap-3">
                    <FaLocationArrow />
                    <p>{address}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <FaMobileAlt />
                    <p>{phone}</p>
                  </div>

                  {/* social links */}
                  <div className="flex items-center gap-3 mt-6">
                    <a href={socials.instagram || "#"} target="_blank" rel="noreferrer">
                      <FaInstagram className="text-3xl hover:text-primary duration-200" />
                    </a>
                    <a href={socials.facebook || "#"} target="_blank" rel="noreferrer">
                      <FaFacebook className="text-3xl hover:text-primary duration-200" />
                    </a>
                    <a href={socials.linkedin || "#"} target="_blank" rel="noreferrer">
                      <FaLinkedin className="text-3xl hover:text-primary duration-200" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional: show an empty state if loaded but no data (shouldn't happen with fallback) */}
        {!loading && !error && !data && (
          <div style={{ padding: 12 }}>No footer found.</div>
        )}
      </div>
    </div>
  );
}
