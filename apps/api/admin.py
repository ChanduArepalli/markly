"""
SQLAdmin views for Markly.
Accessible at /admin — protected by username/password session auth.
"""
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from config import settings
from database import engine
from models.user import User
from models.bookmark import Bookmark
from models.collection import Collection
from models.tag import Tag
from models.refresh_token import RefreshToken


# ── Auth backend ──────────────────────────────────────────────────

class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username", "")
        password = form.get("password", "")
        if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
            request.session.update({"admin_authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("admin_authenticated", False)


# ── Model views ───────────────────────────────────────────────────

class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-users"
    category = "Accounts"

    # Columns shown in list view
    column_list = [
        User.id, User.email, User.full_name,
        User.is_active, User.is_verified,
        User.google_id, User.created_at,
    ]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list  = [User.email, User.created_at, User.is_active]
    column_default_sort   = [(User.created_at, True)]

    # Fields shown in detail / edit forms
    form_excluded_columns = [
        "hashed_password", "bookmarks", "tags", "collections", "refresh_tokens",
    ]

    # Detail view columns
    column_details_list = [
        User.id, User.email, User.full_name, User.avatar_url,
        User.is_active, User.is_verified, User.google_id,
        User.created_at, User.updated_at,
    ]

    can_create = False   # Users sign up via the app
    can_delete = True
    can_export = True


class BookmarkAdmin(ModelView, model=Bookmark):
    name = "Bookmark"
    name_plural = "Bookmarks"
    icon = "fa-solid fa-bookmark"
    category = "Content"

    column_list = [
        Bookmark.id, Bookmark.title, Bookmark.domain,
        Bookmark.is_read, Bookmark.is_pinned,
        Bookmark.user_id, Bookmark.collection_id,
        Bookmark.created_at,
    ]
    column_searchable_list = [Bookmark.title, Bookmark.url, Bookmark.domain]
    column_sortable_list   = [
        Bookmark.created_at, Bookmark.domain,
        Bookmark.is_read, Bookmark.is_pinned,
    ]
    column_default_sort = [(Bookmark.created_at, True)]

    column_details_list = [
        Bookmark.id, Bookmark.url, Bookmark.title, Bookmark.description,
        Bookmark.domain, Bookmark.favicon_url, Bookmark.og_image_url,
        Bookmark.is_read, Bookmark.is_pinned,
        Bookmark.user_id, Bookmark.collection_id,
        Bookmark.created_at, Bookmark.updated_at,
    ]

    # Exclude relationship objects from the form to avoid N+1 issues
    form_excluded_columns = ["user", "tags"]

    can_export = True


class CollectionAdmin(ModelView, model=Collection):
    name = "Collection"
    name_plural = "Collections"
    icon = "fa-solid fa-folder-open"
    category = "Content"

    column_list = [
        Collection.id, Collection.icon, Collection.name,
        Collection.color, Collection.is_public,
        Collection.user_id, Collection.created_at,
    ]
    column_searchable_list = [Collection.name, Collection.description]
    column_sortable_list   = [Collection.name, Collection.created_at, Collection.is_public]
    column_default_sort    = [(Collection.created_at, True)]

    column_details_list = [
        Collection.id, Collection.icon, Collection.name, Collection.description,
        Collection.color, Collection.is_public,
        Collection.user_id, Collection.created_at, Collection.updated_at,
    ]

    form_excluded_columns = ["user", "bookmarks"]
    can_export = True


class TagAdmin(ModelView, model=Tag):
    name = "Tag"
    name_plural = "Tags"
    icon = "fa-solid fa-tag"
    category = "Content"

    column_list = [
        Tag.id, Tag.name, Tag.color,
        Tag.user_id, Tag.created_at,
    ]
    column_searchable_list = [Tag.name]
    column_sortable_list   = [Tag.name, Tag.created_at]
    column_default_sort    = [(Tag.created_at, True)]

    column_details_list = [
        Tag.id, Tag.name, Tag.color,
        Tag.user_id, Tag.created_at,
    ]

    form_excluded_columns = ["user", "bookmarks"]
    can_export = True


class RefreshTokenAdmin(ModelView, model=RefreshToken):
    name = "Refresh Token"
    name_plural = "Refresh Tokens"
    icon = "fa-solid fa-key"
    category = "Accounts"

    column_list = [
        RefreshToken.id, RefreshToken.user_id,
        RefreshToken.expires_at, RefreshToken.is_revoked,
        RefreshToken.ip_address, RefreshToken.created_at,
    ]
    column_sortable_list  = [RefreshToken.created_at, RefreshToken.expires_at, RefreshToken.is_revoked]
    column_default_sort   = [(RefreshToken.created_at, True)]
    column_details_list   = [
        RefreshToken.id, RefreshToken.user_id, RefreshToken.token_hash,
        RefreshToken.expires_at, RefreshToken.is_revoked,
        RefreshToken.last_used_at, RefreshToken.user_agent,
        RefreshToken.ip_address, RefreshToken.created_at,
    ]

    form_excluded_columns = ["user"]
    can_create = False
    can_export = True


# ── Factory ───────────────────────────────────────────────────────

def create_admin(app) -> Admin:
    """Mount SQLAdmin onto the FastAPI app and register all views."""
    auth_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(
        app,
        engine,
        title="Markly Admin",
        authentication_backend=auth_backend,
    )

    admin.add_view(UserAdmin)
    admin.add_view(BookmarkAdmin)
    admin.add_view(CollectionAdmin)
    admin.add_view(TagAdmin)
    admin.add_view(RefreshTokenAdmin)

    return admin
