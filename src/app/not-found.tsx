import Link from "next/link";
import { buttonStyles } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-lg font-semibold">Lead not found</h1>
      <p className="mt-2 text-sm text-stone-600">It may have been removed, or the link is incomplete.</p>
      <Link href="/" className={`${buttonStyles("secondary")} mt-6`}>
        Back to all leads
      </Link>
    </div>
  );
}
