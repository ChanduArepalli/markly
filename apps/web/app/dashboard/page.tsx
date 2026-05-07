"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { bookmarks as api, tags as tagsApi, collections as collectionsApi } from "@/lib/api";
import { Bookmark, Tag, Collection, BookmarkListResponse } from "@/types";
import BookmarkGrid from "@/components/BookmarkGrid";
import AddBookmarkModal from "@/components/AddBookmarkModal";
import SearchBar from "@/components/SearchBar";
import styles from "./page.module.css";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active URL params
  const urlCollection = searchParams.get("collection");
  const urlTag        = searchParams.get("tag");
  const urlFilter     = searchParams.get("filter"); // "pinned" | "unread"

  // Data
  const [data, setData] = useState<BookmarkListResponse | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showAdd, setShowAdd] = useState(false);
  const [editBookmark, setEditBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Build params that respect the active context
  const buildParams = useCallback((): Record<string, string | number | boolean> => {
    const p: Record<string, string | number | boolean> = {};
    if (urlCollection) p.collection_id = urlCollection;
    if (urlTag)        p.tag           = urlTag;
    if (urlFilter === "pinned") p.is_pinned = true;
    if (urlFilter === "unread") p.is_read   = false;
    return p;
  }, [urlCollection, urlTag, urlFilter]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [bm, cols, ts] = await Promise.all([
        searchQuery ? api.search(searchQuery, params) : api.list(params),
        collectionsApi.list(),
        tagsApi.list(),
      ]);
      setData(bm);
      setCollections(cols);
      setTags(ts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, buildParams]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await api.delete(id);
    setData((prev) =>
      prev ? { ...prev, data: prev.data.filter((b) => b.id !== id), total: prev.total - 1 } : prev
    );
  };

  const handleToggleRead = async (bookmark: Bookmark) => {
    const updated = await api.update(bookmark.id, { is_read: !bookmark.is_read });
    setData((prev) =>
      prev ? { ...prev, data: prev.data.map((b) => (b.id === updated.id ? updated : b)) } : prev
    );
  };

  const handleTogglePin = async (bookmark: Bookmark) => {
    const updated = await api.update(bookmark.id, { is_pinned: !bookmark.is_pinned });
    setData((prev) =>
      prev ? { ...prev, data: prev.data.map((b) => (b.id === updated.id ? updated : b)) } : prev
    );
  };

  const handleEdit = (bookmark: Bookmark) => setEditBookmark(bookmark);

  // ── Navigation helpers ────────────────────────────────────────
  /** Navigate preserving or swapping a single param */
  const nav = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`/dashboard${next.toString() ? `?${next}` : ""}`);
  };

  const activeCollection = collections.find((c) => c.id === urlCollection) ?? null;

  // ── Derived title ─────────────────────────────────────────────
  const pageTitle = (() => {
    if (activeCollection) {
      if (urlFilter === "pinned") return `${activeCollection.icon} Pinned`;
      if (urlFilter === "unread") return `${activeCollection.icon} Unread`;
      if (urlTag)                 return `${activeCollection.icon} #${urlTag}`;
      return `${activeCollection.icon} ${activeCollection.name}`;
    }
    if (urlFilter === "pinned") return "Pinned";
    if (urlFilter === "unread") return "Unread";
    if (urlTag)                 return `#${urlTag}`;
    return "All Bookmarks";
  })();

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{pageTitle}</h1>
          {data && <span className={styles.count}>{data.total} saved</span>}
        </div>
        <div className={styles.headerRight}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <button id="btn-add-bookmark" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            Add
          </button>
        </div>
      </header>

      {/* ── Collection filter bar ───────────────────────────────── */}
      {collections.length > 0 && (
        <div className={styles.filterBar}>
          <button
            className={`${styles.collPill} ${!urlCollection ? styles.collPillActive : ""}`}
            onClick={() => router.push("/dashboard")}
          >
            All
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              className={`${styles.collPill} ${urlCollection === c.id ? styles.collPillActive : ""}`}
              style={{ "--col-c": c.color } as React.CSSProperties}
              onClick={() => {
                if (urlCollection === c.id) router.push("/dashboard");
                else router.push(`/dashboard?collection=${c.id}`);
              }}
            >
              <span className={styles.collPillIcon}>{c.icon}</span>
              {c.name}
              {c.bookmark_count > 0 && (
                <span className={styles.pillCount}>{c.bookmark_count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Contextual sub-filters ──────────────────────────────── */}
      <div className={styles.subFilters}>
        {/* Status filters */}
        <div className={styles.subFilterGroup}>
          {(["", "pinned", "unread"] as const).map((f) => {
            const label = f === "" ? "All" : f === "pinned" ? "📌 Pinned" : "● Unread";
            const active = (f === "" && !urlFilter) || urlFilter === f;
            return (
              <button
                key={f}
                className={`${styles.subPill} ${active ? styles.subPillActive : ""}`}
                onClick={() => nav("filter", f || null)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tag sub-filters (only when tags exist) */}
        {tags.length > 0 && (
          <div className={styles.subFilterDivider} />
        )}
        {tags.length > 0 && (
          <div className={styles.subFilterGroup}>
            {tags.map((t) => (
              <button
                key={t.id}
                className={`${styles.tagPill} ${urlTag === t.name ? styles.tagPillActive : ""}`}
                style={{ "--tag-color": t.color } as React.CSSProperties}
                onClick={() => nav("tag", urlTag === t.name ? null : t.name)}
              >
                <span className={styles.tagDot} style={{ background: t.color }} />
                {t.name}
                {t.bookmark_count > 0 && (
                  <span className={styles.pillCount}>{t.bookmark_count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <BookmarkGrid
        bookmarks={data?.data ?? []}
        loading={loading}
        onDelete={handleDelete}
        onToggleRead={handleToggleRead}
        onTogglePin={handleTogglePin}
        onEdit={handleEdit}
        onRefresh={fetchAll}
      />

      {showAdd && (
        <AddBookmarkModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchAll(); }}
        />
      )}
      {editBookmark && (
        <AddBookmarkModal
          bookmark={editBookmark}
          onClose={() => setEditBookmark(null)}
          onSuccess={() => { setEditBookmark(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
