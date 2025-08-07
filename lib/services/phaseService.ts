// lib/services/phaseService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Utilitaire pour les headers d'authentification (CORRIGÉ - utilise 'token' au lieu de 'token')
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
    
    // Gestion spéciale des erreurs 401
    if (response.status === 401) {
      console.log('🔐 Erreur 401 - Token invalide ou expiré')
      
      // Supprimer le token invalide
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.dispatchEvent(new CustomEvent('auth-error'))
      }
      
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }
    
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }
  return response.json();
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}

// ===== INTERFACES TYPESCRIPT =====

export interface Phase {
  id: number;
  projet_id: number;
  nom: string;
  description?: string;
  date_debut?: string;
  date_fin_prevue?: string;
  date_fin_reelle?: string;
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'En pause' | 'Annulée';
  ordre: number;
  budget_alloue?: number;
  budget_consomme?: number;
  pourcentage_avancement: number;
  responsable_id?: number;
  responsable_nom?: string;
  responsable_email?: string;
  nb_livrables?: number;
  created_at: string;
  updated_at: string;
}

// ===== SERVICE PHASES =====
export const phaseService = {
  // Récupérer les phases d'un projet
  async getProjectPhases(projectId: number): Promise<ApiResponse<Phase[]>> {
    try {
      console.log(`🔍 Chargement des phases pour le projet ${projectId}`);
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases`, {
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse<Phase[]>(response);
      console.log(`✅ ${result.data?.length || 0} phases chargées`);
      return result;
    } catch (error) {
      console.error('❌ Erreur chargement phases:', error);
      throw error;
    }
  },

  // Créer une nouvelle phase
  async createPhase(projectId: number, phaseData: Partial<Phase>): Promise<ApiResponse<Phase>> {
    try {
      console.log('🔄 Création d\'une nouvelle phase:', phaseData);
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(phaseData),
      });
      
      const result = await handleResponse<Phase>(response);
      console.log('✅ Phase créée avec succès');
      return result;
    } catch (error) {
      console.error('❌ Erreur création phase:', error);
      throw error;
    }
  },

  // Mettre à jour une phase
  async updatePhase(phaseId: number, phaseData: Partial<Phase>): Promise<ApiResponse<void>> {
    try {
      console.log(`🔄 Mise à jour de la phase ${phaseId}:`, phaseData);
      
      const response = await fetch(`${API_BASE_URL}/phases/${phaseId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(phaseData),
      });
      
      const result = await handleResponse<void>(response);
      console.log('✅ Phase mise à jour avec succès');
      return result;
    } catch (error) {
      console.error('❌ Erreur mise à jour phase:', error);
      throw error;
    }
  },

  // Supprimer une phase
  async deletePhase(phaseId: number): Promise<ApiResponse<void>> {
    try {
      console.log(`🗑️ Suppression de la phase ${phaseId}`);
      
      const response = await fetch(`${API_BASE_URL}/phases/${phaseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse<void>(response);
      console.log('✅ Phase supprimée avec succès');
      return result;
    } catch (error) {
      console.error('❌ Erreur suppression phase:', error);
      throw error;
    }
  }
};

// Export par défaut pour faciliter l'import
export default {
  phases: phaseService,
};