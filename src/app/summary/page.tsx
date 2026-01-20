import { Suspense } from "react";
import { SummaryContent } from "@/components/SummaryContent";

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SummaryContent />
    </Suspense>
  );
}