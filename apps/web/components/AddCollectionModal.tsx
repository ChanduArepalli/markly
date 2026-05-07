"use client";

import { useState } from "react";
import { collections as api } from "@/lib/api";
import { Collection } from "@/types";
import styles from "./AddCollectionModal.module.css";

const ICONS = ["📁", "📚", "🎨", "💡", "🔬", "🎯", "🛠️", "🌍", "🎵", "💼", "🏠", "🌱", "⭐", "🔖", "🎬"];
const COLORS = [
  "#14b8a6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#f97316", "#ec4899", "#6366f1", "#84cc16",
];

interface Props {
  /** Pass an existing collection to enter edit mode */
  collection?: Collection;
  onClose: () => void;
  onSuccess: (collection: Collection) => void;
}

export default function AddCollectionModal({ collection: existing, onClose, onSuccess }: Props) {
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "📁");
  const [color, setColor] = useState(existing?.color ?? "#14b8a6");
  const [isPublic, setIsPublic] = useState(existing?.is_public ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, description: description || undefined, icon, color, is_public: isPublic };
      const result = isEdit && existing
        ? await api.update(existing.id, payload)
        : await api.create(payload);
      onSuccess(result);
    } catch (err: any) {
      setError(err.message ?? `Failed to ${isEdit ? "update" : "create"} collection`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit collection" : "Add collection"}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit collection" : "New collection"}</h2>
          <button id="btn-close-collection-modal" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Icon + name row */}
          <div className={styles.nameRow}>
            <div className={styles.iconPreview} style={{ background: `${color}22`, borderColor: `${color}44` }}>
              <span>{icon}</span>
            </div>
            <div className={styles.nameField}>
              <label htmlFor="col-name" className="label">Name *</label>
              <input
                id="col-name"
                type="text"
                className="input"
                placeholder="e.g. Design inspiration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Icon picker */}
          <div className={styles.field}>
            <span className="label">Icon</span>
            <div className={styles.iconPicker}>
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  className={`${styles.iconOption} ${icon === ic ? styles.iconOptionActive : ""}`}
                  style={icon === ic ? { borderColor: color, background: `${color}18` } : {}}
                  onClick={() => setIcon(ic)}
                  aria-label={ic}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className={styles.field}>
            <span className="label">Color</span>
            <div className={styles.colorPicker}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorSwatch} ${color === c ? styles.colorSwatchActive : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="col-desc" className="label">Description (optional)</label>
            <textarea
              id="col-desc"
              className={`input ${styles.textarea}`}
              placeholder="What's this collection for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Public toggle */}
          <label className={styles.toggleRow} htmlFor="col-public">
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>Make public</span>
              <span className={styles.toggleSub}>Anyone with the link can view</span>
            </div>
            <div
              className={`${styles.toggle} ${isPublic ? styles.toggleOn : ""}`}
              style={isPublic ? { background: color } : {}}
              onClick={() => setIsPublic((p) => !p)}
              role="switch"
              aria-checked={isPublic}
              id="col-public"
            >
              <div className={styles.toggleThumb} />
            </div>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              id="btn-create-collection"
              type="submit"
              className="btn btn-primary"
              style={{ background: color }}
              disabled={loading || !name.trim()}
            >
              {loading ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create collection")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
