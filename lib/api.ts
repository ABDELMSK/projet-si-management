// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Fonction utilitaire pour les requêtes API
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    let data
    try {
      data = await response.json()
    } catch (e) {
      // Si pas de JSON, créer un objet d'erreur
      data = { message: `Erreur ${response.status}` }
    }
    
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data)
      
      // Gestion spéciale des erreurs 401
      if (response.status === 401) {
        console.log('🔐 Erreur 401 - Token invalide ou expiré')
        
        // Supprimer le token invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          
          // Déclencher un événement pour notifier les autres composants
          window.dispatchEvent(new CustomEvent('auth-error'))
        }
        
        throw new Error('Session expirée. Veuillez vous reconnecter.')
      }
      
      throw new Error(data.message || `Erreur ${response.status}`)
    }
    
    console.log(`✅ API Success: ${endpoint}`, data)
    return data
  } catch (error) {
    console.error(`❌ API Request failed: ${endpoint}`, error)
    throw error
  }
}

// === SERVICES D'AUTHENTIFICATION ===
export const authService = {
  async login(email: string, password: string) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    // ✅ CORRECTION: Le backend retourne directement success, token, user
    if (response.success && response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token)
        console.log('🔐 Token sauvegardé')
        
        // Optionnel: sauvegarder aussi les infos utilisateur
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }
    }
    
    return response
  },

  async me() {
    return apiRequest('/auth/me')
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout API failed:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.log('🔐 Token et données utilisateur supprimés')
      }
    }
  },
}

// === SERVICES UTILISATEURS ===
export const userService = {
  async getAllUsers() {
    return apiRequest('/users')
  },

  async getUserById(id: number) {
    return apiRequest(`/users/${id}`)
  },

  async createUser(userData: any) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async updateUser(id: number, userData: any) {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  async deleteUser(id: number) {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// === SERVICES PROJETS ===
export const projectService = {
  async getAllProjects(params?: { search?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.status) queryParams.append('status', params.status)
    
    const endpoint = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return apiRequest(endpoint)
  },

  // Alias pour compatibilité
  async getProjects(params?: { search?: string; status?: string }) {
    return this.getAllProjects(params)
  },

  async getProjectById(id: number) {
    return apiRequest(`/projects/${id}`)
  },

  async createProject(projectData: {
    nom: string;
    code: string;
    description?: string;
    chef_projet_id: number;
    direction_id: number;
    statut_id: number;
    budget?: number | null;
    date_debut?: string | null;
    date_fin_prevue?: string | null;
    priorite?: string;
  }) {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  },

  async updateProject(id: number, projectData: any) {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  },

  async deleteProject(id: number) {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  async getProjectStats() {
    return apiRequest('/projects/stats')
  },

  async getRecentProjects(limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return apiRequest(`/projects/recent${params}`)
  },

  async getProjectDashboard() {
    return apiRequest('/projects/dashboard')
  },
}

// === SERVICES DE RÉFÉRENCE ===
export const referenceService = {
  async getDirections() {
    return apiRequest('/reference/directions')
  },

  async getRoles() {
    return apiRequest('/reference/roles')
  },

  async getProjectStatuses() {
    return apiRequest('/reference/project-statuses')
  },

  async getChefsProjets() {
    return apiRequest('/reference/users/chefs-projets')
  },
}

// ✅ ALIAS D'EXPORT POUR COMPATIBILITÉ
// Si certains composants utilisent des noms différents
export const projectApi = projectService
export const userApi = userService
export const authApi = authService
export const referenceApi = referenceService

// Export par défaut pour faciliter l'import
export default {
  auth: authService,
  users: userService,
  projects: projectService,
  reference: referenceService,
}

// === TYPES TYPESCRIPT ===
export interface User {
  id: number
  nom: string
  email: string
  role_nom: string
  direction_nom: string
  statut: 'Actif' | 'Inactif' | 'Suspendu'
  dernier_acces: string
  created_at: string
  permissions?: string
}

export interface Project {
  id: number
  nom: string
  description: string
  chef_projet_id: number
  chef_projet_nom: string
  chef_projet_email?: string
  direction_id: number
  direction_nom: string
  statut_id: number
  statut_nom: string
  statut_couleur: string
  budget: number
  date_debut: string
  date_fin_prevue: string
  date_fin_reelle?: string
  pourcentage_avancement: number
  priorite: 'Basse' | 'Normale' | 'Haute' | 'Critique'
  nb_taches: number
  taches_terminees?: number
  taches_completees_pct?: number
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total_projets: number
  projets_en_cours: number
  projets_termines: number
  projets_en_pause: number
  avancement_moyen: number
  budget_total: number
}

export interface Direction {
  id: number
  nom: string
  description: string
}

export interface Role {
  id: number
  nom: string
  permissions: string
}

export interface ProjectStatus {
  id: number
  nom: string
  couleur: string
  ordre: number
}

// Fonction utilitaire pour vérifier si l'utilisateur est connecté
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  return !!token
}


// Fonction utilitaire pour forcer la déconnexion
export function forceLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

}
// Interfaces étendues pour CRUD
export interface CreateProjectData {
  nom: string;
  description?: string;
  chef_projet_id: number;
  direction_id: number;
  statut_id: number;
  budget?: number;
  date_debut?: string;
  date_fin_prevue?: string;
  priorite?: string;
}
