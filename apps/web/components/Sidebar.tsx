"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { auth, collections as collectionsApi, tags as tagsApi } from "@/lib/api";
import { Collection, Tag, User } from "@/types";
import AddCollectionModal from "./AddCollectionModal";
import AddTagModal from "./AddTagModal";
import styles from "./Sidebar.module.css";

interface Props {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [showAddTag, setShowAddTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  useEffect(() => {
    Promise.all([auth.me(), collectionsApi.list(), tagsApi.list()])
      .then(([u, c, t]) => { setUser(u); setCollections(c); setTags(t); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    router.push("/");
  };

  const activeTag = searchParams.get("tag");
  const activeCollection = searchParams.get("collection");

  if (!open) {
    return (
      <button id="btn-open-sidebar" className={styles.toggleBtn} onClick={onToggle} aria-label="Open sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <nav className={styles.sidebar} aria-label="Main navigation">
        {/* Logo + collapse */}
        <div className={styles.logoRow}>
          <Link href="/dashboard" className={styles.logo}>
            <Image 
              src="/logo.png" 
              alt="Markly Logo" 
              width={100} 
              height={28} 
              priority
              className={styles.logoImg}
            />
          </Link>
          <button id="btn-close-sidebar" className={styles.collapseBtn} onClick={onToggle} aria-label="Collapse sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className={styles.section}>
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === "/dashboard" && !activeCollection ? styles.navItemActive : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
              <path d="M9 21V9h6v12" strokeLinecap="round" />
            </svg>
            All bookmarks
          </Link>
          <Link href="/dashboard?filter=pinned" className={`${styles.navItem} ${searchParams.get("filter") === "pinned" ? styles.navItemActive : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2L8 8H2l10 14 10-14h-6L12 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pinned
          </Link>
          <Link href="/dashboard?filter=unread" className={`${styles.navItem} ${searchParams.get("filter") === "unread" ? styles.navItemActive : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
            </svg>
            Unread
          </Link>
        </div>

        {/* Collections */}
        <div className={styles.section}>
          {/* Section header with + button */}
          <div className={styles.sectionHeader}>
            <button
              className={styles.sectionLabelBtn}
              onClick={() => setCollectionsExpanded((p) => !p)}
              aria-expanded={collectionsExpanded}
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={collectionsExpanded ? styles.chevronDown : styles.chevronRight}
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Collections
            </button>
            <button
              id="btn-add-collection"
              className={styles.addBtn}
              onClick={() => setShowAddCollection(true)}
              title="New collection"
              aria-label="Add collection"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Collection list */}
          {collectionsExpanded && (
            <div className={styles.collectionList}>
              {collections.length === 0 ? (
                <button
                  className={styles.emptyCollections}
                  onClick={() => setShowAddCollection(true)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  Create your first collection
                </button>
              ) : (
                collections.map((c) => (
                  <div
                    key={c.id}
                    className={styles.collectionRow}
                  >
                    <Link
                      href={`/dashboard?collection=${c.id}`}
                      className={`${styles.navItem} ${activeCollection === c.id ? styles.navItemActive : ""}`}
                      style={activeCollection === c.id ? { "--item-color": c.color } as React.CSSProperties : {}}
                    >
                      <span className={styles.collectionIcon}
                        style={{ background: `${c.color}20`, borderColor: `${c.color}33` }}
                      >
                        {c.icon}
                      </span>
                      <span className={styles.navItemName}>{c.name}</span>
                      {c.bookmark_count > 0 && (
                        <span className={styles.navItemCount}>{c.bookmark_count}</span>
                      )}
                    </Link>
                    <button
                      className={styles.rowEditBtn}
                      onClick={() => setEditingCollection(c)}
                      title={`Edit "${c.name}"`}
                      aria-label={`Edit ${c.name}`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className={styles.section}>
          {/* Section header */}
          <div className={styles.sectionHeader}>
            <button
              className={styles.sectionLabelBtn}
              onClick={() => setTagsExpanded((p) => !p)}
              aria-expanded={tagsExpanded}
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={tagsExpanded ? styles.chevronDown : styles.chevronRight}
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tags
            </button>
            <button
              id="btn-add-tag"
              className={styles.addBtn}
              onClick={() => setShowAddTag(true)}
              title="New tag"
              aria-label="Add tag"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Tag list */}
          {tagsExpanded && (
            <div className={styles.tagList}>
              {tags.length === 0 ? (
                <button
                  className={styles.emptyCollections}
                  onClick={() => setShowAddTag(true)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  Create your first tag
                </button>
              ) : (
                tags.map((t) => (
                  <div key={t.id} className={styles.collectionRow}>
                    <Link
                      href={`/dashboard?tag=${encodeURIComponent(t.name)}`}
                      className={`${styles.tagNavItem} ${activeTag === t.name ? styles.tagNavItemActive : ""}`}
                      style={{ "--tag-c": t.color } as React.CSSProperties}
                    >
                      <span
                        className={styles.tagDot}
                        style={{ background: t.color }}
                      />
                      <span className={styles.navItemName}>{t.name}</span>
                      {t.bookmark_count > 0 && (
                        <span className={styles.navItemCount}>{t.bookmark_count}</span>
                      )}
                    </Link>
                    <button
                      className={styles.rowEditBtn}
                      onClick={() => setEditingTag(t)}
                      title={`Edit "${t.name}"`}
                      aria-label={`Edit ${t.name}`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {user && (
            <Link href="/profile" className={styles.userRowLink} title="Account Settings">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className={styles.avatar} width={28} height={28} />
              ) : (
                <div className={styles.avatarPlaceholder}>{(user.full_name ?? user.email)[0].toUpperCase()}</div>
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.full_name ?? "User"}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </Link>
          )}
          <button id="btn-logout" className={`btn btn-ghost ${styles.logoutBtn}`} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Add collection modal */}
      {showAddCollection && (
        <AddCollectionModal
          onClose={() => setShowAddCollection(false)}
          onSuccess={(created) => {
            setCollections((prev) => [...prev, created]);
            setShowAddCollection(false);
          }}
        />
      )}

      {/* Edit collection modal */}
      {editingCollection && (
        <AddCollectionModal
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onSuccess={(updated) => {
            setCollections((prev) => prev.map((c) => c.id === updated.id ? updated : c));
            setEditingCollection(null);
          }}
        />
      )}

      {/* Add tag modal */}
      {showAddTag && (
        <AddTagModal
          onClose={() => setShowAddTag(false)}
          onSuccess={(created) => {
            setTags((prev) => [...prev, created]);
            setShowAddTag(false);
          }}
        />
      )}
      {/* Edit tag modal */}
      {editingTag && (
        <AddTagModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSuccess={(updated) => {
            setTags((prev) => prev.map((t) => t.id === updated.id ? updated : t));
            setEditingTag(null);
          }}
        />
      )}
    </>
  );
}
