"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
      <main className={`${styles.main} ${!sidebarOpen ? styles.mainExpanded : ""}`}>
        {children}
      </main>
    </div>
  );
}
