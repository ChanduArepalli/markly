"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  const [local, setLocal] = useState(value || "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  return (
    <div className={styles.wrapper}>
      <svg className={styles.icon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        id="search-bookmarks"
        type="search"
        className={styles.input}
        placeholder="Search bookmarks…"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        autoComplete="off"
      />
      {local && (
        <button className={styles.clear} onClick={() => handleChange("")} aria-label="Clear search">×</button>
      )}
    </div>
  );
}
