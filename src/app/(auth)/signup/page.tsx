import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: true },
};

function FormSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
