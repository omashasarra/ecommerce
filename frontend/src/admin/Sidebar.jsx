// src/components/Sidebar.jsx
export default function Sidebar({ items, active, onSelect }) {
  return (
    <aside
      className="
        sticky top-0 h-full p-3 border-r
        bg-gray-50 border-gray-200
        dark:bg-slate-900 dark:border-slate-800
      "
    >
      <h3 className="mx-2 mt-2 mb-4 font-semibold text-gray-800 dark:text-slate-100">
        Admin Panel
      </h3>

      <nav className="space-y-2">
        {items.map((x) => {
          const isActive = x === active;
          return (
            <button
              key={x}
              onClick={() => onSelect(x)}
              className={[
                "block w-full text-left rounded-md px-3 py-2 border transition",
                isActive
                  ? // active styles
                    "bg-blue-50 border-blue-200 text-blue-700 " +
                    "dark:bg-slate-800/60 dark:border-slate-700 dark:text-white"
                  : // idle + hover styles
                    "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 " +
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 hover:dark:bg-slate-700/60",
              ].join(" ")}
            >
              {x}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
