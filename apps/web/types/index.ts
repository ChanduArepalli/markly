import { UUID } from "crypto";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  bookmark_count: number;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_public: boolean;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionInBookmark {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  domain: string | null;
  is_read: boolean;
  is_pinned: boolean;
  collection_id: string | null;
  collection: CollectionInBookmark | null;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface BookmarkListResponse {
  data: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

export interface BookmarkCreatePayload {
  url: string;
  title?: string;
  description?: string;
  collection_id?: string;
  tag_ids?: string[];
}

export interface BookmarkUpdatePayload {
  title?: string;
  description?: string;
  collection_id?: string | null;
  tag_ids?: string[];
  is_read?: boolean;
  is_pinned?: boolean;
}

export interface TagCreatePayload {
  name: string;
  color?: string;
}

export interface CollectionCreatePayload {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_public?: boolean;
}

export interface ApiError {
  detail: string;
}
