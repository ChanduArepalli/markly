"use client";

import { Bookmark } from "@/types";
import styles from "./BookmarkCard.module.css";

interface Props {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onToggleRead: (bookmark: Bookmark) => void;
  onTogglePin: (bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({ bookmark, onDelete, onToggleRead, onTogglePin, onEdit }: Props) {
  const domain = bookmark.domain ?? (() => {
    try { return new URL(bookmark.url).hostname.replace("www.", ""); } catch { return bookmark.url; }
  })();
  const faviconSrc = bookmark.favicon_url ?? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <article className={`${styles.card} ${bookmark.is_read ? styles.read : ""} ${bookmark.is_pinned ? styles.pinned : ""}`}>
      {/* Pin stripe */}
      {bookmark.is_pinned && <div className={styles.pinStripe} aria-hidden />}

      {/* Card body */}
      <div className={styles.body}>

        {/* Header: logo + title side-by-side, actions on right */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faviconSrc}
                alt={`${domain} logo`}
                width={32}
                height={32}
                className={styles.logo}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                }}
              />
            </div>
            <h3 className={styles.title}>
              {bookmark.title ?? domain}
            </h3>
          </div>

          {/* Actions — visible on hover */}
          <div className={styles.actions}>
            <button
              id={`btn-edit-${bookmark.id}`}
              className={styles.actionBtn}
              onClick={() => onEdit(bookmark)}
              title="Edit"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              id={`btn-pin-${bookmark.id}`}
              className={`${styles.actionBtn} ${bookmark.is_pinned ? styles.actionActive : ""}`}
              onClick={() => onTogglePin(bookmark)}
              title={bookmark.is_pinned ? "Unpin" : "Pin"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmark.is_pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2L8 8H2l10 14 10-14h-6L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              id={`btn-read-${bookmark.id}`}
              className={`${styles.actionBtn} ${bookmark.is_read ? styles.actionActive : ""}`}
              onClick={() => onToggleRead(bookmark)}
              title={bookmark.is_read ? "Mark unread" : "Mark as read"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {bookmark.is_read
                  ? <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  : <circle cx="12" cy="12" r="9" />}
              </svg>
            </button>
            <button
              id={`btn-delete-${bookmark.id}`}
              className={`${styles.actionBtn} ${styles.actionDanger}`}
              onClick={() => onDelete(bookmark.id)}
              title="Delete bookmark"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className={styles.description}>{bookmark.description}</p>
        )}

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <div className={styles.tags}>
            {bookmark.tags.map((tag) => (
              <span
                key={tag.id}
                className={styles.tag}
                style={{ "--tag-c": tag.color } as React.CSSProperties}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer: domain link + collection badge */}
        <div className={styles.footer}>
          <a
            id={`bookmark-link-${bookmark.id}`}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>{domain}</span>
          </a>

          {bookmark.collection && (
            <span
              className={styles.collectionBadge}
              style={{ "--col-c": bookmark.collection.color } as React.CSSProperties}
              title={bookmark.collection.name}
            >
              <span className={styles.collectionBadgeIcon}>{bookmark.collection.icon}</span>
              {bookmark.collection.name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
