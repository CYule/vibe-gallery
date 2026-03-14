"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "NOT_MONETIZED", label: "Not Monetized" },
  { value: "TRYING", label: "Trying" },
  { value: "MONETIZED_SELF_REPORTED", label: "Monetized" },
];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.getAll("status");

  function handleChange(value: string, checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    const next = checked
      ? [...selected, value]
      : selected.filter((s) => s !== value);
    next.forEach((s) => params.append("status", s));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="text-xs font-black uppercase tracking-widest opacity-50">
        Filter
      </span>
      {STATUS_OPTIONS.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={(e) => handleChange(opt.value, e.target.checked)}
            className="accent-black"
          />
          <span className="text-sm font-medium">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
