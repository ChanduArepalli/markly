# Release Notes | v1.0.1 (Security, Compliance & UI Adjustments)

We are proud to release **Markly v1.0.1**, focusing on robust user security, legal compliance, and critical fixes for production deployments.

## 🚀 What's New

### 🔒 Security & Privacy
- **Google reCAPTCHA v3 Integration:** Protects register and login endpoints from automated brute-force attacks and abuse, utilizing backend telemetry action-matching.
- **Self-Service Account Deletion:** Users can now permanently wipe their profile, bookmarks, tags, and collections from our servers through settings.
- **Privacy Policy & Terms of Service:** Integrated responsive, compliant legal pages under `/privacy` and `/terms` matching Markly’s premium dark aesthetics.

### 🛠️ Bug Fixes & Optimizations
- **Subdomain Auth Persistence:** Resolved browser cookie sharing rejections by allowing short-lived tokens to be set locally on the web domain during Google OAuth and credential callback paths.
- **Production-Ready Docker Config:** Removed workspace host volumes and switched Next.js to compile in standalone production mode (`pnpm build` & `pnpm start`) with build-time environment arguments.
- **Domain Image Whitelisting:** Updated `next.config.ts` to allow optimized image loading across production domains.

---

# Release Notes | v1.0.0 (Initial Release)

We are excited to announce the first public release of **Markly**, a modern, open-source bookmarking platform built for the way we use the web today.

## 🚀 What's New

### Core Features

- **URL Auto-Enrichment**: Paste a link, and we'll handle the rest (metadata, favicon, domain parsing).
- **Collections & Tags**: Dual-layered organization for maximum flexibility.
- **Advanced Dashboard**: A highly responsive filtering system that allows you to slice your library by collection, tag, read status, and pinned state.
- **One-Click Add**: A minimalist "Add Bookmark" modal with self-fetching intelligence.
- **Admin Dashboard**: Fully functional `/admin` panel powered by SQLAdmin for developers and admins.

### Design & UX

- **Branding**: Official Markly logo and teal color palette.
- **Tab Experience**: Optimized tab titles and custom favicons for a native-app feel.
- **Auth Flow**: Smooth login/register experience with Google OAuth integration.
- **Responsive Grid**: Fluid bookmark cards that adapt to your screen.

### Technical Foundation

- **Dockerized**: 1-command deployment with `docker-compose`.
- **FastAPI Backend**: Built for speed and scalability.
- **Next.js Frontend**: Leveraging the latest App Router features for performance.

## 🛠️ Installation & Setup

Please refer to the [README.md](README.md) for detailed setup instructions using Docker or local development.

## 📄 MIT License

Markly is now fully open-source under the MIT License. Feel free to fork, contribute, and build your own versions!

---

**Chandu Arepalli**
*Lead Developer*
