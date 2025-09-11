import React from "react";
import { api } from "../../shared/api";
import { FaHeadphonesAlt } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaCarSide } from "react-icons/fa6";

const ICONS = {
  car:        <FaCarSide className="text-4xl md:text-5xl text-primary" />,
  check:      <FaCheckCircle className="text-4xl md:text-5xl text-primary" />,
  wallet:     <FaWallet className="text-4xl md:text-5xl text-primary" />,
  headphones: <FaHeadphonesAlt className="text-4xl md:text-5xl text-primary" />,
};

export default function Services() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api("/api/services"); // { ok, rows }
        if (!alive) return;
        const items = Array.isArray(res?.rows) ? res.rows : [];
        setRows(items);
      } catch {
        setRows([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (!rows.length) return null;

  return (
    <div className="container my-14 md:my-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8">
        {rows.map((s) => (
          <div key={s._id} className="flex flex-col items-start sm:flex-row gap-4">
            {ICONS[s.iconKey] || ICONS["check"]}
            <div>
              <h1 className="lg:text-xl font-bold">{s.title}</h1>
              <h1 className="text-gray-400 text-sm">{s.description}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
