export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface News {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  publishedDate?: string;
  mainImageUrl?: string;
  imageUrls?: string[];
}

export interface Document {
  id: number;
  title: string;
  description?: string;
  filePath: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface NewsCreateRequest {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  published: boolean;
  publishedDate?: string;
  mainImageUrl?: string;
  imageUrls?: string[];
}

export interface CategoryCreateRequest {
  name: string;
  description: string;
}

export interface DocumentCreateRequest {
  title: string;
  fileUrl: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  description: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalNews {
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  publishedDate?: string;
}
