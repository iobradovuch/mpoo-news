import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  News,
  Category,
  Document,
  TeamMember,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  NewsCreateRequest,
  CategoryCreateRequest,
  DocumentCreateRequest,
  ExternalNews,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.api.post<LoginResponse>('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
    }
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }

  // News
  async getNews(page = 0, size = 10, categoryId?: number, keyword?: string): Promise<PaginatedResponse<News>> {
    const params: Record<string, unknown> = { page, size };
    if (categoryId) params.categoryId = categoryId;
    if (keyword) params.keyword = keyword;
    const { data } = await this.api.get<PaginatedResponse<News>>('/news', { params });
    return data;
  }

  async getNewsById(id: number): Promise<News> {
    const { data } = await this.api.get<News>(`/news/${id}`);
    return data;
  }

  async createNews(news: NewsCreateRequest): Promise<News> {
    const { data } = await this.api.post<News>('/news', news);
    return data;
  }

  async updateNews(id: number, news: NewsCreateRequest): Promise<News> {
    const { data } = await this.api.put<News>(`/news/${id}`, news);
    return data;
  }

  async deleteNews(id: number): Promise<void> {
    await this.api.delete(`/news/${id}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data } = await this.api.get<Category[]>('/categories');
    return data;
  }

  async createCategory(category: CategoryCreateRequest): Promise<Category> {
    const { data } = await this.api.post<Category>('/categories', category);
    return data;
  }

  async updateCategory(id: number, category: CategoryCreateRequest): Promise<Category> {
    const { data } = await this.api.put<Category>(`/categories/${id}`, category);
    return data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    const { data } = await this.api.get<Document[]>('/documents/all');
    return data;
  }

  async createDocument(doc: DocumentCreateRequest): Promise<Document> {
    const { data } = await this.api.post<Document>('/documents', doc);
    return data;
  }

  async deleteDocument(id: number): Promise<void> {
    await this.api.delete(`/documents/${id}`);
  }

  // Team
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data } = await this.api.get<TeamMember[]>('/team');
    return data;
  }

  async getAllTeamMembersForAdmin(): Promise<TeamMember[]> {
    const { data } = await this.api.get<TeamMember[]>('/team/admin');
    return data;
  }

  async getTeamMemberById(id: number): Promise<TeamMember> {
    const { data } = await this.api.get<TeamMember>(`/team/${id}`);
    return data;
  }

  async createTeamMember(member: Record<string, unknown>): Promise<TeamMember> {
    const { data } = await this.api.post<TeamMember>('/team', member);
    return data;
  }

  async updateTeamMember(id: number, member: Record<string, unknown>): Promise<TeamMember> {
    const { data } = await this.api.put<TeamMember>(`/team/${id}`, member);
    return data;
  }

  async deleteTeamMember(id: number): Promise<void> {
    await this.api.delete(`/team/${id}`);
  }

  // News import
  async scrapeExternalNews(): Promise<ExternalNews[]> {
    const { data } = await this.api.get<ExternalNews[]>('/news-import/scrape');
    return data;
  }

  async importSelectedNews(selectedNews: ExternalNews[]): Promise<{ success: boolean; importedCount: number; message: string }> {
    const { data } = await this.api.post('/news-import/import-selected', selectedNews);
    return data;
  }

  // File upload
  async uploadImage(file: File, onProgress?: (pct: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data.url;
  }

  async uploadDocument(file: File, onProgress?: (pct: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data.url;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filename = fileUrl.split('/').pop();
    if (filename) await this.api.delete(`/upload/delete/${filename}`);
  }
}

const apiService = new ApiService();
export default apiService;
