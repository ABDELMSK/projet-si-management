const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}

// ===== SERVICE PHASES =====
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
  nb_livrables?: number;
  created_at: string;
  updated_at: string;
}

export const phaseService = {
  // Récupérer les phases d'un projet
  async getProjectPhases(projectId: number): Promise<ApiResponse<Phase[]>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Phase[]>(response);
  },

  // Créer une nouvelle phase
  async createPhase(projectId: number, phaseData: Partial<Phase>): Promise<ApiResponse<Phase>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(phaseData),
    });
    return handleResponse<Phase>(response);
  },

  // Mettre à jour une phase
  async updatePhase(phaseId: number, phaseData: Partial<Phase>): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/phases/${phaseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(phaseData),
    });
    return handleResponse<void>(response);
  },

  // Supprimer une phase
  async deletePhase(phaseId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/phases/${phaseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  }
};

// ===== SERVICE PRESTATAIRES =====
export interface Prestataire {
  id: number;
  nom: string;
  siret?: string;
  adresse?: string;
  contact_nom?: string;
  contact_email?: string;
  contact_telephone?: string;
  domaine_expertise?: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  nb_projets_actifs?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjetPrestataire {
  id: number;
  projet_id: number;
  prestataire_id: number;
  role_prestataire: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'Actif' | 'Terminé' | 'Suspendu';
  prestataire?: Prestataire;
}

export const prestataireService = {
  // Récupérer tous les prestataires
  async getAllPrestataires(): Promise<ApiResponse<Prestataire[]>> {
    const response = await fetch(`${API_BASE_URL}/prestataires`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Prestataire[]>(response);
  },

  // Créer un nouveau prestataire
  async createPrestataire(prestataireData: Partial<Prestataire>): Promise<ApiResponse<{ id: number }>> {
    const response = await fetch(`${API_BASE_URL}/prestataires`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prestataireData),
    });
    return handleResponse<{ id: number }>(response);
  },

  // Récupérer les prestataires d'un projet
  async getProjectPrestataires(projectId: number): Promise<ApiResponse<ProjetPrestataire[]>> {
    const response = await fetch(`${API_BASE_URL}/prestataires/projects/${projectId}/prestataires`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ProjetPrestataire[]>(response);
  },

  // Associer un prestataire à un projet
  async associateToProject(projectId: number, prestataireId: number, role: string, dateDebut?: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/prestataires/projects/${projectId}/prestataires/${prestataireId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role_prestataire: role, date_debut: dateDebut }),
    });
    return handleResponse<void>(response);
  }
};

// ===== SERVICE CONTRATS =====
export interface Contrat {
  id: number;
  projet_id: number;
  numero_contrat: string;
  intitule: string;
  prestataire_id?: number;
  prestataire_nom?: string;
  montant?: number;
  date_signature?: string;
  date_debut?: string;
  date_fin?: string;
  statut: 'En négociation' | 'Signé' | 'En cours' | 'Terminé' | 'Résilié';
  fichier_contrat?: string;
  conditions_particulieres?: string;
  created_by: number;
  created_by_nom?: string;
  created_at: string;
  updated_at: string;
}

export const contratService = {
  // Récupérer les contrats d'un projet
  async getProjectContrats(projectId: number): Promise<ApiResponse<Contrat[]>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contrats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Contrat[]>(response);
  },

  // Créer un nouveau contrat
  async createContrat(projectId: number, contratData: Partial<Contrat>): Promise<ApiResponse<Contrat>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/contrats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(contratData),
    });
    return handleResponse<Contrat>(response);
  },

  // Mettre à jour un contrat
  async updateContrat(contratId: number, contratData: Partial<Contrat>): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/contrats/${contratId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(contratData),
    });
    return handleResponse<void>(response);
  }
};

// ===== SERVICE LIVRABLES =====
export interface Livrable {
  id: number;
  projet_id: number;
  phase_id?: number;
  phase_nom?: string;
  contrat_id?: number;
  contrat_intitule?: string;
  nom: string;
  description?: string;
  type_livrable: 'Document' | 'Code' | 'Formation' | 'Matériel' | 'Service';
  date_prevue?: string;
  date_reelle?: string;
  statut: 'Planifié' | 'En cours' | 'Livré' | 'Validé' | 'Refusé';
  responsable_id?: number;
  responsable_nom?: string;
  validateur_id?: number;
  validateur_nom?: string;
  fichier_path?: string;
  commentaires?: string;
  poids_projet: number;
  nb_documents?: number;
  created_at: string;
  updated_at: string;
}

export const livrableService = {
  // Récupérer les livrables d'un projet
  async getProjectLivrables(projectId: number): Promise<ApiResponse<Livrable[]>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/livrables`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Livrable[]>(response);
  },

  // Créer un nouveau livrable
  async createLivrable(projectId: number, livrableData: Partial<Livrable>): Promise<ApiResponse<Livrable>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/livrables`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(livrableData),
    });
    return handleResponse<Livrable>(response);
  },

  // Mettre à jour un livrable
  async updateLivrable(livrableId: number, livrableData: Partial<Livrable>): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/livrables/${livrableId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(livrableData),
    });
    return handleResponse<void>(response);
  }
};

// ===== SERVICE DOCUMENTS =====
export interface DocumentProjet {
  id: number;
  projet_id: number;
  phase_id?: number;
  phase_nom?: string;
  livrable_id?: number;
  livrable_nom?: string;
  contrat_id?: number;
  contrat_intitule?: string;
  nom_fichier: string;
  nom_original: string;
  chemin_fichier: string;
  taille_fichier: number;
  type_mime: string;
  categorie: 'Cahier des charges' | 'Contrat' | 'Livrable' | 'PV' | 'Planning' | 'Budget' | 'Autre';
  description?: string;
  version: string;
  uploaded_by: number;
  uploaded_by_nom?: string;
  uploaded_at: string;
}

export const documentService = {
  // Récupérer les documents d'un projet
  async getProjectDocuments(projectId: number): Promise<ApiResponse<DocumentProjet[]>> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/documents`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DocumentProjet[]>(response);
  },

  // Upload d'un document
  async uploadDocument(
    projectId: number, 
    file: File, 
    metadata: {
      phase_id?: number;
      livrable_id?: number;
      contrat_id?: number;
      categorie?: string;
      description?: string;
    }
  ): Promise<ApiResponse<DocumentProjet>> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse<DocumentProjet>(response);
  },

  // Télécharger un document
  downloadDocument(documentId: number): string {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const url = `${API_BASE_URL}/documents/${documentId}/download`;
    
    if (token) {
      return `${url}?token=${token}`;
    }
    return url;
  },

  // Supprimer un document
  async deleteDocument(documentId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  }
};

// ===== SERVICE RAPPORTS =====
export interface DashboardData {
  stats: {
    total_projets: number;
    projets_en_cours: number;
    projets_termines: number;
    projets_en_pause: number;
    budget_total: number;
    budget_consomme: number;
    avancement_moyen: number;
  };
  projetsParDirection: Array<{
    direction: string;
    nb_projets: number;
    budget_total: number;
    avancement_moyen: number;
  }>;
  projetsParStatut: Array<{
    statut: string;
    couleur: string;
    nb_projets: number;
  }>;
  evolutionMensuelle: Array<{
    mois: string;
    nouveaux_projets: number;
    projets_termines: number;
  }>;
  topProjets: Array<{
    nom: string;
    pourcentage_avancement: number;
    chef_projet_nom: string;
    statut_nom: string;
  }>;
  alertes: Array<{
    nom: string;
    date_fin_prevue: string;
    pourcentage_avancement: number;
    chef_projet_nom: string;
  }>;
  generated_at: string;
}

export const reportService = {
  // Télécharger un rapport Excel
  async downloadExcelReport(): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/projects/excel`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du rapport');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_projets_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Récupérer les données du dashboard
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    const response = await fetch(`${API_BASE_URL}/reports/dashboard/data`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardData>(response);
  },

  // Récupérer le rapport détaillé d'un projet
  async getProjectDetailReport(projectId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/reports/project/${projectId}/detail`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  }
};

// ===== SERVICE DASHBOARD AVANCÉ =====
export interface AdvancedDashboard {
  kpis: {
    total_projets: number;
    projets_en_retard: number;
    projets_presque_finis: number;
    avancement_global: number;
    budget_total_portefeuille: number;
    budget_consomme_total: number;
    projets_risque_eleve: number;
  };
  chargeChefs: Array<{
    chef_projet: string;
    nb_projets_actifs: number;
    avancement_moyen: number;
    budget_gere: number;
  }>;
  evolutionPortefeuille: Array<{
    mois: string;
    nouveaux_projets: number;
    budget_nouveaux_projets: number;
  }>;
  prestataireStats: Array<{
    prestataire: string;
    nb_projets: number;
    nb_contrats: number;
    montant_total_contrats: number;
  }>;
  livrablesEnRetard: Array<{
    livrable: string;
    projet: string;
    date_prevue: string;
    jours_retard: number;
    responsable: string;
  }>;
  derniere_maj: string;
}

export interface AlertesDashboard {
  alertes: Array<{
    id: number;
    nom: string;
    date_fin_prevue: string;
    pourcentage_avancement: number;
    sante_projet: string;
    chef_projet_nom: string;
    statut_nom: string;
    jours_restants: number;
    type_alerte: 'RETARD' | 'RISQUE' | 'SANTE_CRITIQUE' | 'INACTIF';
  }>;
  nb_alertes: number;
  generated_at: string;
}

export const dashboardService = {
  // Dashboard avancé PMO
  async getAdvancedDashboard(): Promise<ApiResponse<AdvancedDashboard>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/advanced`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AdvancedDashboard>(response);
  },

  // Alertes du dashboard
  async getAlerts(): Promise<ApiResponse<AlertesDashboard>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/alerts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AlertesDashboard>(response);
  }
};

// Export par défaut pour faciliter l'import
export default {
  phases: phaseService,
  prestataires: prestataireService,
  contrats: contratService,
  livrables: livrableService,
  documents: documentService,
  reports: reportService,
  dashboard: dashboardService,
};