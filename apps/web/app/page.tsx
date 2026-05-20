"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { executeReCaptcha } from "@/lib/recaptcha";
import Script from "next/script";
import styles from "./page.module.css";

type Mode = "login" | "register";

export default function LandingPage() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  
  // Auth Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Authenticated State (null = checking, true = logged in, false = logged out)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Retrieve current profile in the background to verify active session
    auth.me()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const openAuth = (selectedMode: Mode) => {
    setMode(selectedMode);
    setError("");
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setError("");
  };

  const handleSignInClick = async () => {
    if (isAuthenticated === true) {
      window.location.href = "/dashboard";
    } else if (isAuthenticated === false) {
      openAuth("login");
    } else {
      // If profile request is still ongoing, make an active check
      setLoading(true);
      try {
        await auth.me();
        setIsAuthenticated(true);
        window.location.href = "/dashboard";
      } catch {
        setIsAuthenticated(false);
        openAuth("login");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGetStartedClick = async () => {
    if (isAuthenticated === true) {
      window.location.href = "/dashboard";
    } else if (isAuthenticated === false) {
      openAuth("register");
    } else {
      setLoading(true);
      try {
        await auth.me();
        setIsAuthenticated(true);
        window.location.href = "/dashboard";
      } catch {
        setIsAuthenticated(false);
        openAuth("register");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const recaptchaToken = await executeReCaptcha(mode);

      let response: any;
      if (mode === "register") {
        response = await auth.register(email, password, name, recaptchaToken);
      } else {
        response = await auth.login(email, password, recaptchaToken);
      }

      // Manually set a cookie so the frontend server can read it
      // The API still has its own secure cookie, but we need this one for SSR
      if (response && response.access_token) {
        document.cookie = `access_token=${response.access_token}; path=/; max-age=${15 * 60}; samesite=lax; secure`;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { auth_url } = await auth.googleAuthUrl();
      window.location.href = auth_url;
    } catch (err: any) {
      setError(err.message ?? "Google login unavailable");
    }
  };

  return (
    <main className={styles.root}>
      {siteKey && (
        <Script
          src={`https://www.recaptcha.net/recaptcha/enterprise.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      )}
      
      {/* Background glow orbs */}
      <div className={styles.orb1} aria-hidden />
      <div className={styles.orb2} aria-hidden />

      {/* ─── GLOBAL NAVIGATION BAR ────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Image
              src="/logo.png"
              alt="Markly Logo"
              width={100}
              height={26}
              priority
              className={styles.navLogo}
            />
          </div>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#tech" className={styles.navLink}>Tech Stack</a>
            <a href="https://github.com/chanduarepalli/markly" target="_blank" rel="noopener noreferrer" className={styles.navLink}>GitHub</a>
            {isAuthenticated === true ? (
              <button 
                id="nav-btn-signin"
                className="btn btn-ghost styles.signInBtn" 
                onClick={handleSignInClick}
              >
                Dashboard
              </button>
            ) : (
              <button 
                id="nav-btn-signin"
                className="btn btn-ghost styles.signInBtn" 
                onClick={handleSignInClick}
                disabled={loading}
              >
                {loading ? "..." : "Sign In"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.badge}>
          <span className={styles.badgePulse} />
          Open Source Release v1.0
        </div>
        <h1 className={styles.heroTitle}>
          A minimal workspace for your <br />
          <span className={styles.gradientText}>favorite corners of the web.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Markly is a premium, beautifully curated bookmark manager designed for productivity and aesthetics. Save collections, tag links, and search your library instantly.
        </p>
        <div className={styles.heroActions}>
          {isAuthenticated === true ? (
            <button 
              id="hero-btn-getstarted"
              className="btn btn-primary styles.btnPrimaryLarge"
              onClick={handleGetStartedClick}
            >
              Go to Dashboard
            </button>
          ) : (
            <button 
              id="hero-btn-getstarted"
              className="btn btn-primary styles.btnPrimaryLarge"
              onClick={handleGetStartedClick}
              disabled={loading}
            >
              {loading ? "..." : "Get Started — Free"}
            </button>
          )}
          <a 
            href="https://github.com/chanduarepalli/markly" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-ghost styles.btnSecondaryLarge"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginRight: '6px' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Star on GitHub
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className={styles.heroPreviewContainer}>
          <Image
            src="/dashboard_mockup.png"
            alt="Markly Premium Dashboard"
            width={1060}
            height={680}
            priority
            className={styles.heroMockup}
          />
        </div>
      </section>

      {/* ─── FEATURES GRID SECTION ───────────────────────────────────── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need. Done beautifully.</h2>
          <p className={styles.sectionSubtitle}>Ditch the cluttered, basic browser bookmark bar. Markly offers custom high-performance organization tools.</p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Smart Scraper</h3>
            <p className={styles.featureDescription}>Input a URL, and our asynchronous backend automatically scrapes Open Graph tags to fetch page titles, descriptions, and favicons instantly.</p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Deep Organization</h3>
            <p className={styles.featureDescription}>Group related bookmarks into custom Collections (like Projects or Reading lists) and append highly searchable cross-reference Tags.</p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Lightning Search</h3>
            <p className={styles.featureDescription}>Search across all stored bookmark descriptions, URLs, titles, and tag configurations concurrently. Results stream in with zero delay.</p>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Built for Speed</h3>
            <p className={styles.featureDescription}>Engineered for power users with smooth hover states, reactive transitions, and optimized server-side processing for high productivity.</p>
          </div>

          {/* Feature 5 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Admin Panel Control</h3>
            <p className={styles.featureDescription}>Includes an integrated administrative panel at `/admin` built on SQLAdmin, offering direct database monitoring and query verification.</p>
          </div>

          {/* Feature 6 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>MIT Open-Source</h3>
            <p className={styles.featureDescription}>Self-host your private bookmarking library on your own infrastructure. Clean, single-command Docker setups configure the entire environment.</p>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK SHOWCASE SECTION ─────────────────────────────── */}
      <section id="tech" className={styles.stackSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Modern, High-Performance Stack</h2>
          <p className={styles.sectionSubtitle}>We use state-of-the-art technologies to guarantee reliability, low-latency, and modularity.</p>
        </div>

        <div className={styles.stackGrid}>
          <div className={styles.stackCard}>
            <span className={styles.stackIcon}>⚡</span>
            <h3>FastAPI</h3>
            <p>High-speed Python Web API</p>
          </div>
          <div className={styles.stackCard}>
            <span className={styles.stackIcon}>🌐</span>
            <h3>Next.js 16</h3>
            <p>React App Router Client</p>
          </div>
          <div className={styles.stackCard}>
            <span className={styles.stackIcon}>🐘</span>
            <h3>PostgreSQL</h3>
            <p>Robust Relational Database</p>
          </div>
          <div className={styles.stackCard}>
            <span className={styles.stackIcon}>🐳</span>
            <h3>Docker</h3>
            <p>Seamless Containerization</p>
          </div>
        </div>
      </section>

      {/* ─── COMPLIANT BRAND FOOTER ───────────────────────────────────── */}
      <footer className={styles.marketingFooter}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrand}>
            <Image
              src="/logo.png"
              alt="Markly Logo"
              width={80}
              height={22}
              className={styles.footerLogo}
            />
            <span className={styles.footerText}>© 2026 Markly. Released under the MIT License.</span>
          </div>
          <div className={styles.footerNav}>
            <Link href="/terms" className={styles.footerNavLink}>Terms of Service</Link>
            <Link href="/privacy" className={styles.footerNavLink}>Privacy Policy</Link>
            <a href="https://github.com/chanduarepalli/markly" target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>GitHub Repository</a>
          </div>
        </div>
      </footer>

      {/* ─── GLASSMORPHIC AUTHENTICATION MODAL ───────────────────────── */}
      {isAuthOpen && (
        <div className={styles.modalOverlay} onClick={closeAuth}>
          <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
            <button 
              id="modal-close-btn"
              className={styles.closeBtn} 
              onClick={closeAuth}
              title="Close Panel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={styles.card}>
              {/* Logo */}
              <div className={styles.logoRow}>
                <Image
                  src="/logo.png"
                  alt="Markly Logo"
                  width={110}
                  height={32}
                  priority
                  className={styles.logoImg}
                />
              </div>

              <h2 className={styles.headline}>
                {mode === "login" ? "Welcome back" : "Start bookmarking"}
              </h2>
              <p className={styles.sub}>
                {mode === "login"
                  ? "Sign in to your personal bookmark library."
                  : "Create an account. It takes 10 seconds."}
              </p>

              {/* Google OAuth */}
              <button
                id="btn-google-auth"
                type="button"
                className={styles.googleBtn}
                onClick={handleGoogle}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form}>
                {mode === "register" && (
                  <div className={styles.field}>
                    <label htmlFor="input-name" className="label">Full name</label>
                    <input
                      id="input-name"
                      type="text"
                      className="input"
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={styles.field}>
                  <label htmlFor="input-email" className="label">Email</label>
                  <input
                    id="input-email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="input-password" className="label">Password</label>
                  <input
                    id="input-password"
                    type="password"
                    className="input"
                    placeholder={mode === "register" ? "Min 8 chars, uppercase, number, symbol" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                  id="btn-submit-auth"
                  type="submit"
                  className={`btn btn-primary ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className={styles.recaptchaNotice}>
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
              </p>

              <p className={styles.toggle}>
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  id="btn-toggle-mode"
                  type="button"
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                  className={styles.toggleLink}
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>

              <div className={styles.legalFooter}>
                <Link href="/terms" onClick={closeAuth}>Terms of Service</Link>
                <span>•</span>
                <Link href="/privacy" onClick={closeAuth}>Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
