// lib/userService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types pour les utilisateurs
export interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  role_nom?: string;
  direction: string;
  direction_nom?: string;
  statut: string;
  dernierAcces?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  nom: string;
  email: string;
  password: string;
  role_id: number;
  direction_id: number;
}

export interface UpdateUserData {
  nom?: string;
  email?: string;
  role_id?: number;
  direction_id?: number;
  statut?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}

// Utilitaire pour les headers d'authentification
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Gestion d'erreurs API
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: `Erreur HTTP ${response.status}`,
    }));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }
  return response.json();
}

export const userService = {
  // Récupérer tous les utilisateurs
  async getAllUsers(searchTerm?: string): Promise<ApiResponse<User[]>> {
    const url = new URL(`${API_BASE_URL}/users`);
    if (searchTerm) {
      url.searchParams.append('search', searchTerm);
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<User[]>(response);
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: UpdateUserData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(response);
  },

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  // Récupérer son propre profil
  async getMyProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(response);
  },

  // Statistiques des utilisateurs
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    by_role: Array<{ role: string; count: number }>;
    by_direction: Array<{ direction: string; count: number }>;
  }>> {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default userService;