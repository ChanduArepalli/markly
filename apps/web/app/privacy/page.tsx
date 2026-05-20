"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../legal.module.css";

export default function PrivacyPolicy() {
  return (
    <main className={styles.root}>
      {/* Background glow orbs */}
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Markly Logo"
              width={100}
              height={28}
              priority
              className={styles.logoImg}
            />
          </Link>
          <Link href="/" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to login
          </Link>
        </header>

        <h1 className={styles.title}>Privacy Policy</h1>
        
        <div className={styles.meta}>
          <span>Last Updated: May 19, 2026</span>
          <span className={styles.tag}>Developer Preview</span>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <p>
              Welcome to <span className={styles.highlight}>Markly</span> ("we," "our," or "the Platform"). Markly is an open-source bookmark manager. This Privacy Policy outlines how we handle, process, and protect your information when you access and use this developer preview, testing, and deployment instance of Markly hosted at <span className={styles.highlight}>markly.chanduarepalli.com</span>.
            </p>
            <p>
              <strong className={styles.highlight}>Important Context:</strong> This website is hosted and maintained by an individual developer for development, testing, and personal preview purposes. It is <span className={styles.highlight}>not operated by any commercial company or legal corporation</span>. We take your privacy very seriously, and <strong className={styles.highlight}>we do not sell, rent, or share your data with any third parties</strong>.
            </p>
          </div>

          <div className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>We only collect the minimum amount of personal data necessary to provide you with secure authentication and bookmark organization features. This includes:</p>
            <ul>
              <li>
                <span className={styles.highlight}>Account Credentials:</span> If you register via email and password, we securely store your email address and full name. Your password is hashed using Argon2id before saving and is never stored in plain text.
              </li>
              <li>
                <span className={styles.highlight}>Google Account Information (Google OAuth):</span> If you choose to log in using Google OAuth, we request access to standard, non-sensitive profile scopes (`openid`, `email`, `profile`). We only store your Google email address, full name, Google profile picture URL (avatar), and your unique Google account identifier (`google_id`). We do not access or request any other Google data.
              </li>
              <li>
                <span className={styles.highlight}>Bookmark Content:</span> When you save bookmarks on Markly, we store the URL, page titles, page descriptions, tags, and custom collections you create. This information is saved directly in our private PostgreSQL database.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>2. Google reCAPTCHA v3 Integration</h2>
            <p>
              To protect the Platform from spam, brute-force attacks, and abusive automated scripts, we integrate <span className={styles.highlight}>Google reCAPTCHA v3</span> on our authentication endpoints.
            </p>
            <p>
              Google reCAPTCHA works invisibly in the background by analyzing your interaction patterns (such as mouse movements and keystrokes) to calculate a risk score. The collection and processing of this telemetry data are subject to the Google Privacy Policy and Terms of Service. You can review their policies at:
            </p>
            <ul>
              <li>
                <a href="https://policies.google.com/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
              </li>
              <li>
                <a href="https://policies.google.com/terms" className={styles.link} target="_blank" rel="noopener noreferrer">Google Terms of Service</a>
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>Your collected information is strictly used for the following purposes:</p>
            <ul>
              <li>To create and maintain your secure user account.</li>
              <li>To allow you to log in, persist your session (via secure cookies), and sync bookmarks across your browser.</li>
              <li>To automatically retrieve Open Graph metadata (like page titles and descriptions) for URLs you bookmark.</li>
              <li>To prevent malicious registrations and secure our server infrastructure.</li>
            </ul>
            <p>
              Your data is stored in our private database and is <strong className={styles.highlight}>never shared, sold, targeted, or transferred to any third-party marketing, analytics, or advertising firms</strong>.
            </p>
          </div>

          <div className={styles.section}>
            <h2>4. Cookies and Session Persistence</h2>
            <p>
              We use secure, standard web cookies to manage your authentication state:
            </p>
            <ul>
              <li>
                <span className={styles.highlight}>access_token:</span> A JSON Web Token (JWT) that identifies your authenticated session. Stored securely and transmitted to our API to fetch your bookmarks.
              </li>
              <li>
                <span className={styles.highlight}>refresh_token:</span> A cryptographic token used to safely rotate your access session without requiring you to log in repeatedly.
              </li>
            </ul>
            <p>
              In production environments, these cookies are marked as `HttpOnly`, `Secure`, and are configured with strict `SameSite` policies to protect against Cross-Site Request Forgery (CSRF) and cross-site scripting (XSS) attacks.
            </p>
          </div>

          <div className={styles.section}>
            <h2>5. Data Control and Deletion</h2>
            <p>
              As the owner of your data, you have full control over your saved information:
            </p>
            <ul>
              <li>You can delete individual bookmarks, tags, and collections directly inside your dashboard at any time.</li>
              <li>You can request a complete wipe of your account and all associated bookmark data. Since this is a developer instance, please contact the administrator (contact information below) to completely delete your database record.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>6. Security of Your Data</h2>
            <p>
              We implement robust security practices to safeguard your data, including end-to-end HTTPS encryption, containerized architectures, secure Argon2id password hashing, and encrypted database networks. However, because this is an open-source development and testing preview, we advise against storing highly sensitive, proprietary, or confidential bookmarks.
            </p>
          </div>

          <div className={styles.section}>
            <h2>7. Contact and Support</h2>
            <p>
              For questions regarding this Privacy Policy, your data, or to request manual account deletion, please open an issue on the open-source repository or reach out directly to the administrator:
            </p>
            <ul>
              <li>
                <span className={styles.highlight}>GitHub Project:</span> <a href="https://github.com/chanduarepalli/markly" className={styles.link} target="_blank" rel="noopener noreferrer">github.com/chanduarepalli/markly</a>
              </li>
              <li>
                <span className={styles.highlight}>Developer Email:</span> <a href="mailto:chandu.arepalli@gmail.com" className={styles.link}>chandu.arepalli@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>© 2026 Markly. Open-source under the MIT License.</p>
        </footer>
      </div>
    </main>
  );
}
