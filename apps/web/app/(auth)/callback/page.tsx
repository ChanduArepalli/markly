"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const status = params.get("status");
    const token = params.get("token");

    if (token) {
      document.cookie = `access_token=${token}; path=/; max-age=${15 * 60}; samesite=lax; secure`;
    }

    if (status === "error") {
      router.push("/?error=oauth_failed");
    } else {
      router.push("/dashboard");
    }
  }, [params, router]);

  return (
    <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family-sans)" }}>
      Completing sign-in…
    </p>
  );
}

export default function AuthCallbackPage() {
  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <Suspense fallback={
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family-sans)" }}>
          Loading…
        </p>
      }>
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
