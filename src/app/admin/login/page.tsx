import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Staff sign-in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ink" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
