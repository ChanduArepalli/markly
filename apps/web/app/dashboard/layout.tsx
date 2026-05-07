import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Protect route server-side: if no access_token cookie, redirect to login
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
