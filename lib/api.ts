// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour les requêtes avec gestion automatique du token
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Récupérer le token depuis le localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Ajouter le token d'authentification si disponible
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Erreur de requête', data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Erreur de connexion au serveur');
  }
}

// === SERVICES D'AUTHENTIFICATION ===
export const authService = {
  async login(email: string, password: string) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Sauvegarder le token
    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    }

    return response;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  async getCurrentUser() {
    return apiRequest('/auth/me');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Récupérer l'utilisateur du localStorage
  getStoredUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// === SERVICES UTILISATEURS ===
export const userService = {
  async getAllUsers(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/users${params}`);
  },

  async getUserById(id: number) {
    return apiRequest(`/users/${id}`);
  },

  async createUser(userData: {
    nom: string;
    email: string;
    password: string;
    role_id: number;
    direction_id: number;
  }) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id: number, userData: any) {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(id: number) {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// === SERVICES PROJETS ===
export const projectService = {
  async getAllProjects(params?: { search?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return apiRequest(`/projects${queryString ? `?${queryString}` : ''}`);
  },

  async getProjectById(id: number) {
    return apiRequest(`/projects/${id}`);
  },

  async createProject(projectData: {
    nom: string;
    description?: string;
    chef_projet_id: number;
    direction_id: number;
    statut_id: number;
    budget?: number;
    date_debut?: string;
    date_fin_prevue?: string;
    priorite?: string;
  }) {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async updateProject(id: number, projectData: any) {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  async deleteProject(id: number) {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async getProjectStats() {
    return apiRequest('/projects/stats');
  },

  async getRecentProjects(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest(`/projects/recent${params}`);
  },

  async getProjectDashboard() {
    return apiRequest('/projects/dashboard');
  },
};

// === SERVICES DE RÉFÉRENCE ===
export const referenceService = {
  async getDirections() {
    return apiRequest('/reference/directions');
  },

  async getRoles() {
    return apiRequest('/reference/roles');
  },

  async getProjectStatuses() {
    return apiRequest('/reference/project-statuses');
  },
};

// === TYPES TYPESCRIPT ===
export interface User {
  id: number;
  nom: string;
  email: string;
  role_nom: string;
  direction_nom: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  dernier_acces: string;
  created_at: string;
  permissions?: string;
}

export interface Project {
  id: number;
  nom: string;
  description: string;
  chef_projet_id: number;
  chef_projet_nom: string;
  chef_projet_email?: string;
  direction_id: number;
  direction_nom: string;
  statut_id: number;
  statut_nom: string;
  statut_couleur: string;
  budget: number;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  pourcentage_avancement: number;
  priorite: 'Basse' | 'Normale' | 'Haute' | 'Critique';
  nb_taches: number;
  taches_terminees?: number;
  taches_completees_pct?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_projets: number;
  projets_en_cours: number;
  projets_termines: number;
  projets_en_pause: number;
  avancement_moyen: number;
  budget_total: number;
}

export interface Direction {
  id: number;
  nom: string;
  description: string;
}

export interface Role {
  id: number;
  nom: string;
  permissions: string;
}

export interface ProjectStatus {
  id: number;
  nom: string;
  couleur: string;
  ordre: number;
}