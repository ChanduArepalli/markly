"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../legal.module.css";

export default function TermsOfService() {
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

        <h1 className={styles.title}>Terms of Service</h1>
        
        <div className={styles.meta}>
          <span>Last Updated: May 19, 2026</span>
          <span className={styles.tag}>Developer Preview</span>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <p>
              Welcome to <span className={styles.highlight}>Markly</span> ("the Platform"). Please read these Terms of Service ("Terms") carefully before using the developer testing and preview instance of Markly hosted at <span className={styles.highlight}>markly.chanduarepalli.com</span>.
            </p>
            <p>
              By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
            </p>
            <p>
              <strong className={styles.highlight}>Important Context:</strong> This instance is hosted by an individual developer for development preview, open-source testing, and personal exploration purposes. It is <strong className={styles.highlight}>not a commercial software product</strong>, nor is it operated by any registered business entity. If you do not agree to these Terms, please do not use the Platform.
            </p>
          </div>

          <div className={styles.section}>
            <h2>1. Developer Preview License & Open-Source</h2>
            <p>
              Markly is entirely open-source software distributed under the terms of the <strong className={styles.highlight}>MIT License</strong>. You can inspect the source code, download it, and host your own completely private instance by visiting our repository at <a href="https://github.com/chanduarepalli/markly" className={styles.link} target="_blank" rel="noopener noreferrer">github.com/chanduarepalli/markly</a>.
            </p>
            <p>
              This hosted instance is provided solely as a convenient demonstration environment. We reserve the right to modify, suspend, or terminate this specific hosted deployment at any time without notice.
            </p>
          </div>

          <div className={styles.section}>
            <h2>2. No Warranties ("AS IS")</h2>
            <p>
              Consistent with the open-source MIT License, this service is provided <strong className={styles.highlight}>"AS IS," WITHOUT WARRANTY OF ANY KIND</strong>, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              We do not guarantee:
            </p>
            <ul>
              <li>Continuous, uninterrupted, or secure access to the service.</li>
              <li>That your saved bookmark collections or tags will be permanently backed up or free from loss.</li>
              <li>That database migrations, updates, or maintenance will not cause data resets.</li>
            </ul>
            <p>
              Since this is a development database, <strong className={styles.highlight}>periodic database resets or wipes may occur</strong> during major version upgrades or testing phases. We strongly advise users not to use this preview instance as their sole storage for mission-critical bookmarks.
            </p>
          </div>

          <div className={styles.section}>
            <h2>3. Acceptable Use Policy</h2>
            <p>You agree to use Markly in a responsible and lawful manner. You strictly agree NOT to:</p>
            <ul>
              <li>Use the Platform to bookmark, store, or organize malicious links, phishing sites, or links distributing malware.</li>
              <li>Attempt to bypass, disable, or tamper with the authentication systems, backend APIs, SQLAdmin endpoints, or security headers.</li>
              <li>Use automated scripts, crawlers, or bots to flood our servers or trigger database rate limits.</li>
              <li>Impersonate any individual, or bypass our Google reCAPTCHA v3 verification endpoints.</li>
            </ul>
            <p>
              Abuse of the system, API flooding, or attempting to compromise server security will result in immediate suspension, IP blocks, and deletion of your records.
            </p>
          </div>

          <div className={styles.section}>
            <h2>4. Third-Party Integrations & Google Services</h2>
            <p>
              The Platform relies on external Google services to facilitate authentication and protect our security:
            </p>
            <ul>
              <li>
                <span className={styles.highlight}>Google OAuth 2.0:</span> Used to process single sign-on requests. Your sign-in is subject to Google's own authentication terms.
              </li>
              <li>
                <span className={styles.highlight}>Google reCAPTCHA v3:</span> Used to analyze client telemetry to verify you are a human visitor. The collection of this information is governed directly by Google's Privacy Policy and Terms of Service.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>5. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, OR HOSTING ADMINS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, INCLUDING DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL LOSS OF DATA, REVENUE, OR SECURITY.
            </p>
          </div>

          <div className={styles.section}>
            <h2>6. Account Termination</h2>
            <p>
              We reserve the right, in our absolute discretion, to deactivate your account, ban your IP block, or remove your data if we detect abusive activity, long-term inactivity, or if we decide to take down this preview deployment.
            </p>
          </div>

          <div className={styles.section}>
            <h2>7. Amendments to these Terms</h2>
            <p>
              We may update these Terms periodically to reflect changes in our developer deployment or legal guidelines. The date of the latest update will always be posted at the top of this page. Your continued use of the Platform after changes are made constitutes acceptance of the new Terms.
            </p>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>© 2026 Markly. Open-source under the MIT License.</p>
        </footer>
      </div>
    </main>
  );
}
