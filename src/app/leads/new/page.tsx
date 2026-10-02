import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = { title: "New lead" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
          ← All leads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New lead</h1>
      </div>
      <LeadForm />
    </div>
  );
}
