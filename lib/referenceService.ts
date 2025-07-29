// lib/referenceService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types pour les données de référence
export interface Direction {
  id: number;
  nom: string;
  description?: string;
}

export interface Role {
  id: number;
  nom: string;
  description?: string;
}

export interface StatutProjet {
  id: number;
  nom: string;
  couleur: string;
  ordre: number;
}

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: string;
  role_nom?: string;
  direction_nom?: string;
}

export interface ReferenceData {
  directions: Direction[];
  statuts: StatutProjet[];
  utilisateurs: Utilisateur[];
  roles?: Role[];
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
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

export const referenceService = {
  // Récupérer toutes les données de référence en une fois
  async getAllReference(): Promise<ApiResponse<ReferenceData>> {
    const response = await fetch(`${API_BASE_URL}/reference/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ReferenceData>(response);
  },

  // Récupérer les directions
  async getDirections(): Promise<ApiResponse<Direction[]>> {
    const response = await fetch(`${API_BASE_URL}/reference/directions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Direction[]>(response);
  },

  // Récupérer les rôles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await fetch(`${API_BASE_URL}/reference/roles`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Role[]>(response);
  },

  // Récupérer les statuts de projet
  async getStatuts(): Promise<ApiResponse<StatutProjet[]>> {
    const response = await fetch(`${API_BASE_URL}/reference/statuts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<StatutProjet[]>(response);
  },

  // Récupérer les utilisateurs actifs
  async getUtilisateurs(): Promise<ApiResponse<Utilisateur[]>> {
    const response = await fetch(`${API_BASE_URL}/reference/utilisateurs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Utilisateur[]>(response);
  },

  // Récupérer les priorités
  async getPriorites(): Promise<ApiResponse<Array<{
    id: string;
    nom: string;
    couleur: string;
  }>>> {
    const response = await fetch(`${API_BASE_URL}/reference/priorites`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cache simple pour éviter de recharger les données constamment
  _cache: new Map<string, { data: any; timestamp: number }>(),
  
  // Méthode avec cache pour les données qui changent peu
  async getCachedReference<T>(endpoint: string, ttl: number = 300000): Promise<ApiResponse<T>> {
    const cacheKey = endpoint;
    const cached = this._cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return {
        success: true,
        message: 'Données en cache',
        data: cached.data
      };
    }

    const response = await fetch(`${API_BASE_URL}/reference/${endpoint}`, {
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse<T>(response);
    
    if (result.success && result.data) {
      this._cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }
    
    return result;
  },

  // Nettoyer le cache
  clearCache(): void {
    this._cache.clear();
  },

  // Méthodes avec cache pour les données fréquemment utilisées
  async getDirectionsCached(): Promise<ApiResponse<Direction[]>> {
    return this.getCachedReference<Direction[]>('directions');
  },

  async getRolesCached(): Promise<ApiResponse<Role[]>> {
    return this.getCachedReference<Role[]>('roles');
  },

  async getStatutsCached(): Promise<ApiResponse<StatutProjet[]>> {
    return this.getCachedReference<StatutProjet[]>('statuts');
  },
};

export default referenceService;