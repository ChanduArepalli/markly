"use client";

import { Bookmark } from "@/types";
import BookmarkCard from "./BookmarkCard";
import styles from "./BookmarkGrid.module.css";

interface Props {
  bookmarks: Bookmark[];
  loading: boolean;
  onDelete: (id: string) => void;
  onToggleRead: (b: Bookmark) => void;
  onTogglePin: (b: Bookmark) => void;
  onEdit: (b: Bookmark) => void;
  onRefresh: () => void;
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={`skeleton ${styles.skeletonImg}`} />
      <div className={styles.skeletonBody}>
        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "60%" }} />
        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "90%" }} />
        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "70%" }} />
      </div>
    </div>
  );
}

export default function BookmarkGrid({ bookmarks, loading, onDelete, onToggleRead, onTogglePin, onEdit }: Props) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔖</span>
        <p className={styles.emptyTitle}>No bookmarks yet</p>
        <p className={styles.emptySub}>Press the Add button to save your first link.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {bookmarks.map((b, i) => (
        <div key={b.id} style={{ animationDelay: `${i * 40}ms` }}>
          <BookmarkCard
            bookmark={b}
            onDelete={onDelete}
            onToggleRead={onToggleRead}
            onTogglePin={onTogglePin}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
}
