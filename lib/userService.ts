// lib/userService.ts - VERSION CORRIGÉE
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
  password?: string;
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

// Gestion d'erreurs API améliorée
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorData;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch {
        errorData = { success: false, message: `Erreur HTTP ${response.status}` };
      }
    } else {
      errorData = { success: false, message: `Erreur HTTP ${response.status}` };
    }
    
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // Si pas de JSON, retourner une réponse de succès par défaut
    return { success: true, message: 'Opération réussie' } as ApiResponse<T>;
  }
}

export const userService = {
  // Récupérer tous les utilisateurs
  async getAllUsers(searchTerm?: string): Promise<ApiResponse<User[]>> {
    try {
      console.log('🔍 [userService] Récupération des utilisateurs...', searchTerm ? `recherche: ${searchTerm}` : '');
      
      const url = new URL(`${API_BASE_URL}/users`);
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse<User[]>(response);
      console.log('✅ [userService] Utilisateurs récupérés:', result.data?.length || 0);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur getAllUsers:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      console.log('🔍 [userService] Récupération utilisateur ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse<User>(response);
      console.log('✅ [userService] Utilisateur récupéré:', result.data?.nom);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur getUserById:', error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log('➕ [userService] Création utilisateur:', userData.email);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await handleResponse<{ id: number }>(response);
      console.log('✅ [userService] Utilisateur créé, ID:', result.data?.id);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur createUser:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      console.log('🔄 [userService] Mise à jour utilisateur ID:', id, userData);
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await handleResponse<User>(response);
      console.log('✅ [userService] Utilisateur mis à jour:', id);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur updateUser:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('🗑️ [userService] Suppression utilisateur ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse<void>(response);
      console.log('✅ [userService] Utilisateur supprimé:', id);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur deleteUser:', error);
      throw error;
    }
  },

  // Récupérer son propre profil
  async getMyProfile(): Promise<ApiResponse<User>> {
    try {
      console.log('👤 [userService] Récupération du profil...');
      
      const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse<User>(response);
      console.log('✅ [userService] Profil récupéré:', result.data?.nom);
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur getMyProfile:', error);
      throw error;
    }
  },

  // Changer le statut d'un utilisateur
  async toggleUserStatus(id: number, newStatus: 'Actif' | 'Inactif'): Promise<ApiResponse<User>> {
    try {
      console.log('🔄 [userService] Changement statut utilisateur ID:', id, 'vers', newStatus);
      
      return await this.updateUser(id, { statut: newStatus });
    } catch (error) {
      console.error('❌ [userService] Erreur toggleUserStatus:', error);
      throw error;
    }
  },

  // Changer le mot de passe d'un utilisateur
  async changePassword(id: number, newPassword: string): Promise<ApiResponse<User>> {
    try {
      console.log('🔑 [userService] Changement mot de passe utilisateur ID:', id);
      
      return await this.updateUser(id, { password: newPassword });
    } catch (error) {
      console.error('❌ [userService] Erreur changePassword:', error);
      throw error;
    }
  },

  // Statistiques des utilisateurs
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    by_role: Array<{ role: string; count: number }>;
    by_direction: Array<{ direction: string; count: number }>;
  }>> {
    try {
      console.log('📊 [userService] Récupération des statistiques...');
      
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse(response);
      console.log('✅ [userService] Statistiques récupérées');
      
      return result;
    } catch (error) {
      console.error('❌ [userService] Erreur getUserStats:', error);
      throw error;
    }
  },
};

export default userService;