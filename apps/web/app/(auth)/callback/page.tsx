"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // The backend sets cookies and redirects here with ?status=ok
    // or the OAuth callback redirects directly to /dashboard
    const status = params.get("status");
    if (status === "error") {
      router.push("/?error=oauth_failed");
    } else {
      router.push("/dashboard");
    }
  }, [params, router]);

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family-sans)" }}>
        Completing sign-in…
      </p>
    </main>
  );
}
