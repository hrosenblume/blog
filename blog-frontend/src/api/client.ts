/**
 * API client for communicating with Django backend
 */

const API_BASE = '/api';

// Get CSRF token from cookie (Django sets this)
function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// Common fetch options for JSON requests
function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCsrfToken(),
  };
}

// API response types
export interface Post {
  id: string;
  title: string;
  slug: string;
  markdown?: string;
  status: 'draft' | 'published';
  wordCount: number;
  updatedAt: string;
  publishedAt: string | null;
}

export interface PostsListResponse {
  posts: Post[];
}

export interface AuthStatusResponse {
  authenticated: boolean;
  email?: string;
}

export interface CreatePostData {
  title: string;
  slug: string;
  markdown: string;
  status: 'draft' | 'published';
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  markdown?: string;
  status?: 'draft' | 'published';
}

export interface PostResponse {
  id: string;
  slug: string;
  status: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface ApiError {
  error: string;
}

// API client methods
export const api = {
  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<AuthStatusResponse> {
    const res = await fetch(`${API_BASE}/auth/status/`);
    if (!res.ok) {
      throw new Error('Failed to check auth status');
    }
    return res.json();
  },

  /**
   * Get all posts for dashboard
   */
  async getPosts(): Promise<PostsListResponse> {
    const res = await fetch(`${API_BASE}/posts/`);
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to fetch posts');
    }
    return res.json();
  },

  /**
   * Get a single post by ID
   */
  async getPost(id: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}/`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Post not found');
      }
      if (res.status === 403) {
        throw new Error('Not authenticated');
      }
      throw new Error('Failed to fetch post');
    }
    return res.json();
  },

  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<PostResponse> {
    const res = await fetch(`${API_BASE}/posts/create/`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || 'Failed to create post');
    }
    return res.json();
  },

  /**
   * Update an existing post
   */
  async updatePost(id: string, data: UpdatePostData): Promise<PostResponse> {
    const res = await fetch(`${API_BASE}/posts/${id}/update/`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || 'Failed to update post');
    }
    return res.json();
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${id}/delete/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCsrfToken() },
    });
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || 'Failed to delete post');
    }
  },

  /**
   * Upload an image
   */
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload-image/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrfToken() },
      body: formData,
    });
    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || 'Failed to upload image');
    }
    return res.json();
  },

  /**
   * Redirect to login page
   */
  redirectToLogin(): void {
    window.location.href = '/auth/google/';
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Create a form and submit it to handle CSRF properly
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/writer/logout/';
    
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = getCsrfToken();
    form.appendChild(csrfInput);
    
    document.body.appendChild(form);
    form.submit();
  },
};


