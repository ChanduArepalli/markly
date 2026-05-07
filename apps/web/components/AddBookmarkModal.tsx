"use client";

import { useEffect, useState } from "react";
import { bookmarks as bookmarkApi, tags as tagsApi, collections as collectionsApi } from "@/lib/api";
import { Bookmark, Tag, Collection } from "@/types";
import styles from "./AddBookmarkModal.module.css";

interface Props {
  /** Pass a bookmark to enter edit mode */
  bookmark?: Bookmark;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBookmarkModal({ bookmark: existing, onClose, onSuccess }: Props) {
  const isEdit = !!existing;

  // Form state
  const [url, setUrl] = useState(existing?.url ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [collectionId, setCollectionId] = useState(existing?.collection_id ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    existing?.tags.map((t) => t.id) ?? []
  );

  // Loaded data
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Self-fetch tags and collections
  useEffect(() => {
    Promise.all([tagsApi.list(), collectionsApi.list()])
      .then(([t, c]) => { setTags(t); setCollections(c); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  const toggleTag = (id: string) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit && existing) {
        await bookmarkApi.update(existing.id, {
          title: title || undefined,
          description: description || undefined,
          collection_id: collectionId || null,
          tag_ids: selectedTagIds,
        });
      } else {
        await bookmarkApi.create({
          url,
          title: title || undefined,
          description: description || undefined,
          collection_id: collectionId || undefined,
          tag_ids: selectedTagIds,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit bookmark" : "Add bookmark"}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit bookmark" : "Add bookmark"}</h2>
          <button id="btn-close-modal" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* URL — only editable when adding */}
          {!isEdit ? (
            <div className={styles.field}>
              <label htmlFor="modal-url" className="label">URL *</label>
              <input
                id="modal-url"
                type="url"
                className="input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                autoFocus
              />
              <span className={styles.hint}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
                </svg>
                Title &amp; description will be auto-fetched in the background
              </span>
            </div>
          ) : (
            <div className={styles.urlPreview}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round"/>
              </svg>
              <a href={existing.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                {existing.url}
              </a>
            </div>
          )}

          {/* Title */}
          <div className={styles.field}>
            <label htmlFor="modal-title" className="label">Title</label>
            <input
              id="modal-title"
              type="text"
              className="input"
              placeholder={isEdit ? "Bookmark title" : "Override auto-detected title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="modal-desc" className="label">Notes</label>
            <textarea
              id="modal-desc"
              className={`input ${styles.textarea}`}
              placeholder="Your notes or description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Collection picker ─────────────────────────────── */}
          <div className={styles.field}>
            <span className="label">Collection</span>
            {dataLoading ? (
              <div className={styles.loadingRow}>
                <div className={`skeleton ${styles.skeletonPill}`} />
                <div className={`skeleton ${styles.skeletonPill}`} />
                <div className={`skeleton ${styles.skeletonPill}`} />
              </div>
            ) : (
              <div className={styles.collectionPicker}>
                {/* "None" option */}
                <button
                  type="button"
                  className={`${styles.collectionChip} ${!collectionId ? styles.collectionChipActive : ""}`}
                  onClick={() => setCollectionId("")}
                >
                  <span className={styles.collectionChipIcon}>–</span>
                  None
                </button>
                {collections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.collectionChip} ${collectionId === c.id ? styles.collectionChipActive : ""}`}
                    style={collectionId === c.id ? { "--cc": c.color } as React.CSSProperties : { "--cc": c.color } as React.CSSProperties}
                    onClick={() => setCollectionId(c.id)}
                    title={c.name}
                  >
                    <span className={styles.collectionChipIcon}>{c.icon}</span>
                    {c.name}
                  </button>
                ))}
                {collections.length === 0 && (
                  <p className={styles.emptyHint}>No collections yet — create one from the sidebar</p>
                )}
              </div>
            )}
          </div>

          {/* ── Tag picker ────────────────────────────────────── */}
          <div className={styles.field}>
            <span className="label">Tags</span>
            {dataLoading ? (
              <div className={styles.loadingRow}>
                <div className={`skeleton ${styles.skeletonPill}`} />
                <div className={`skeleton ${styles.skeletonPill}`} />
                <div className={`skeleton ${styles.skeletonPill}`} />
              </div>
            ) : tags.length === 0 ? (
              <p className={styles.emptyHint}>No tags yet — create tags from the sidebar</p>
            ) : (
              <div className={styles.tagPicker}>
                {tags.map((t) => {
                  const active = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.tagChip} ${active ? styles.tagChipActive : ""}`}
                      style={{ "--tag-c": t.color } as React.CSSProperties}
                      onClick={() => toggleTag(t.id)}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className={styles.error}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
              </svg>
              {error}
            </p>
          )}

          <div className={styles.footer}>
            <button id="btn-cancel-add" type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              id="btn-save-bookmark"
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!isEdit && !url.trim())}
            >
              {loading ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add bookmark")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
