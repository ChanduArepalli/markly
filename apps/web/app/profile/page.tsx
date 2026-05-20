"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { User } from "@/types";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();

  // Core User profile state
  const [user, setUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Change Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load profile on mount
  useEffect(() => {
    auth.me()
      .then((data) => {
        setUser(data);
        setLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Not authenticated:", err);
        // Force redirect to homepage if unauthorized
        router.push("/");
      });
  }, [router]);

  // Handle password update
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setUpdatingPassword(true);
    try {
      await auth.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message ?? "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeletingAccount(true);
    try {
      await auth.deleteAccount();
      // Wipe frontend cookies and refresh page to landing
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message ?? "Failed to delete account");
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (loadingProfile || !user) {
    return (
      <main className={styles.root}>
        <div className={styles.orb1} />
        <div className={styles.container} style={{ textAlign: "center", marginTop: "10rem" }}>
          <h2 style={{ fontFamily: "var(--font-family-display, serif)", fontSize: "1.75rem", color: "#a1a1aa" }}>
            Loading Profile...
          </h2>
        </div>
      </main>
    );
  }

  // Determine avatar text based on name or email
  const avatarLetter = (user.full_name || user.email || "U").charAt(0).toUpperCase();

  // Format created_at date nicely
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Recently";

  return (
    <main className={styles.root}>
      {/* Glow Backdrops */}
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      <div className={styles.container}>
        {/* Navigation back and header */}
        <header className={styles.backHeader}>
          <Link href="/dashboard" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </Link>
          <h1 className={styles.title}>Account Settings</h1>
        </header>

        {/* SECTION 1: Personal Details */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>👤</span>
            <h2 className={styles.sectionTitle}>Personal Profile</h2>
          </div>
          <div className={styles.userBadgeRow}>
            <div className={styles.avatar}>
              {avatarLetter}
            </div>
            <div className={styles.details}>
              <h3 className={styles.userName}>{user.full_name || "Markly User"}</h3>
              <p className={styles.userEmail}>{user.email}</p>
              <p className={styles.userMetadata}>Member since {joinDate}</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Security Zone (Password Change) */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔑</span>
            <h2 className={styles.sectionTitle}>Security</h2>
          </div>

          {user.google_id ? (
            <div className={styles.messageSuccess} style={{ color: "#a1a1aa", background: "rgba(255, 255, 255, 0.03)", borderColor: "rgba(255, 255, 255, 0.08)" }}>
              🔒 Connected via Google OAuth. Password management is handled securely via Google.
            </div>
          ) : (
            <form className={styles.form} onSubmit={handlePasswordChange}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="curr-pass">Current Password</label>
                <input
                  type="password"
                  id="curr-pass"
                  className={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="new-pass">New Password</label>
                <input
                  type="password"
                  id="new-pass"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="confirm-pass">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-pass"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
              </div>

              {passwordError && <div className={styles.messageError}>{passwordError}</div>}
              {passwordSuccess && <div className={styles.messageSuccess}>{passwordSuccess}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "fit-content", padding: "0.75rem 1.5rem" }}
                disabled={updatingPassword}
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </section>

        {/* SECTION 3: Danger Zone */}
        <section className={`${styles.sectionCard} ${styles.dangerCard}`}>
          <div className={`${styles.sectionHeader} ${styles.dangerHeader}`}>
            <span className={styles.sectionIcon}>⚠️</span>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
          </div>
          <p className={styles.dangerText}>
            Deleting your account is a permanent, non-reversible action. All your collections, tag definitions, and saved bookmarks will be deleted immediately and permanently from our servers.
          </p>
          {deleteError && <div className={styles.messageError} style={{ marginBottom: "1.25rem" }}>{deleteError}</div>}
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </section>
      </div>

      {/* Account Deletion Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>🚨</div>
            <h3 className={styles.modalTitle}>Delete Your Account?</h3>
            <p className={styles.modalText}>
              Are you absolutely sure? This will permanently delete all your data and session records. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
