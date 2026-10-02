import type { ReactNode } from "react";

type ButtonVariant = "primary" | "whatsapp" | "secondary" | "ghost";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-stone-900 text-white hover:bg-stone-700",
  whatsapp: "bg-emerald-700 text-white hover:bg-emerald-800",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
  ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
};

export function buttonStyles(variant: ButtonVariant = "primary") {
  return `inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${BUTTON_VARIANTS[variant]}`;
}

export const inputStyles =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 focus:outline-none aria-invalid:border-red-500";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="text-sm text-stone-500">{hint}</p>
      )}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-semibold tracking-wide text-stone-500 uppercase">{children}</h2>;
}
