import React, { useEffect, useState } from "react";

export default function Partners() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/partners");
      const data = await res.json();
      setRows(data.rows || []);
    }) ();
  }, []);

  return (
    <div className="py-8 mt-24 hidden md:block bg-gray-200 dark:bg-white/10">
      <div className="container">
        <div className="grid grid-cols-5 gap-3 place-items-center opacity-50">
          {rows.map((p) => (
            <img 
            key={p._id}
            src={`/brand/${p.image}`} alt={p.name}
            className="w-[80px] dark:invert"
            loading="lazy"
             />
          ))}
        </div>
      </div>
    </div>
  );
}