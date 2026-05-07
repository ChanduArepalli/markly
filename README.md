# Markly | Modern Bookmark Manager

<p align="center">
  <img src="apps/web/public/logo.png" alt="Markly Logo" width="300" />
</p>

Markly is a premium, open-source bookmarking platform built for productivity and aesthetics. It provides a beautiful, minimal workspace to save, organize, and rediscover your favorite corners of the web.

## ✨ Features

- **Smart Bookmarking**: Automatically fetches page titles, descriptions, and favicons from URLs.
- **Deep Organization**: Use Collections for projects and Tags for cross-referencing.
- **Contextual Filtering**: Powerful URL-driven filtering system that stacks collections, tags, and status (Pinned/Unread).
- **Beautiful UI**: Modern, responsive dashboard with a premium teal aesthetic, dark mode support, and glassmorphism.
- **Admin Control**: Built-in SQLAdmin panel for easy data management at `/admin`.
- **Google OAuth**: One-click login support.
- **Developer Ready**: Clean, containerized architecture using FastAPI and Next.js.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, high-performance Python web framework.
- **SQLModel**: Combined SQLAlchemy and Pydantic power.
- **PostgreSQL**: Robust relational database.
- **Alembic**: Reliable database migrations.
- **SQLAdmin**: Intuitive administrative interface.

### Frontend
- **Next.js 14**: React framework with App Router.
- **Vanilla CSS**: High-performance, flexible styling system.
- **TypeScript**: Type-safe development.

## 🚀 Quick Start (Docker)

The easiest way to get Markly running is with Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/chanduarepalli/markly.git
   cd markly
   ```

2. **Set up your environment**:
   ```bash
   cp .env.example .env
   cp .env.local.example .env.local
   # Edit .env and .env.local with your credentials
   ```

3. **Launch the platform**:
   ```bash
   docker-compose up --build
   ```

4. **Access the apps**:
   - **Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Admin Panel**: [http://localhost:8000/admin](http://localhost:8000/admin)

## 📖 Development

### Backend (apps/api)
- Install dependencies: `pip install -r requirements.txt`
- Run locally: `uvicorn main:app --reload`

### Frontend (apps/web)
- Install dependencies: `npm install`
- Run locally: `npm run dev`

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Chandu Arepalli](https://github.com/chanduarepalli)
