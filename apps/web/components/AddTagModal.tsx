"use client";

import { useState } from "react";
import { tags as api } from "@/lib/api";
import { Tag } from "@/types";
import styles from "./AddTagModal.module.css";

const PRESET_COLORS = [
  "#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#f97316", "#ec4899", "#6366f1", "#84cc16",
  "#06b6d4", "#a855f7", "#fb923c", "#f43f5e", "#64748b",
];

interface Props {
  /** Pass an existing tag to enter edit mode */
  tag?: Tag;
  onClose: () => void;
  onSuccess: (tag: Tag) => void;
}

export default function AddTagModal({ tag: existing, onClose, onSuccess }: Props) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? "#14b8a6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name: name.trim(), color };
      const result = isEdit && existing
        ? await api.update(existing.id, payload)
        : await api.create(payload);
      onSuccess(result);
    } catch (err: any) {
      setError(err.message ?? `Failed to ${isEdit ? "update" : "create"} tag`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit tag" : "Add tag"}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit tag" : "New tag"}</h2>
          <button id="btn-close-tag-modal" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Preview + Name */}
          <div className={styles.nameRow}>
            <span
              className={styles.preview}
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {name || "preview"}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="tag-name" className="label">Tag name *</label>
            <input
              id="tag-name"
              type="text"
              className="input"
              placeholder="e.g. design, research, tools…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              maxLength={50}
            />
          </div>

          {/* Color picker */}
          <div className={styles.field}>
            <span className="label">Color</span>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.swatch} ${color === c ? styles.swatchActive : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  aria-pressed={color === c}
                />
              ))}
            </div>
            {/* Custom hex input */}
            <div className={styles.customColor}>
              <div className={styles.customSwatch} style={{ background: color }} />
              <input
                id="tag-color-hex"
                type="text"
                className={`input ${styles.hexInput}`}
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setColor(val);
                }}
                placeholder="#14b8a6"
                maxLength={7}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              id="btn-create-tag"
              type="submit"
              className="btn btn-primary"
              style={{ background: color, color: "#fff" }}
              disabled={loading || !name.trim()}
            >
              {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create tag")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
