// hooks/useUsers.ts - VERSION CORRIGÉE
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import userService, { 
  type User, 
  type CreateUserData, 
  type UpdateUserData,
  type ApiResponse 
} from '@/lib/userService';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (searchTerm?: string) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUser: (id: number, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleUserStatus: (id: number, newStatus: 'Actif' | 'Inactif') => Promise<boolean>;
  changePassword: (id: number, newPassword: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
  clearError: () => void;
}

export function useUsers(initialSearchTerm?: string): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchTerm, setLastSearchTerm] = useState<string | undefined>(initialSearchTerm);

  // Fonction utilitaire pour afficher les toasts de façon sécurisée
  const showToast = useCallback((title: string, description: string, variant: "default" | "destructive" = "default") => {
    try {
      toast({ title, description, variant });
    } catch (error) {
      console.warn('Toast non disponible:', { title, description });
    }
  }, []);

  // Fonction pour effacer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fonction pour charger les utilisateurs
  const fetchUsers = useCallback(async (searchTerm?: string) => {
    console.log('🔄 [useUsers] Début du chargement des utilisateurs...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response: ApiResponse<User[]> = await userService.getAllUsers(searchTerm);
      
      if (response.success && response.data) {
        console.log('✅ [useUsers] Utilisateurs chargés avec succès:', response.data.length);
        setUsers(response.data);
        setLastSearchTerm(searchTerm);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur lors du chargement:', errorMessage);
      setError(errorMessage);
      setUsers([]); // Reset des utilisateurs en cas d'erreur
      
      showToast(
        "Erreur",
        "Impossible de charger les utilisateurs: " + errorMessage,
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fonction pour créer un utilisateur
  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    console.log('➕ [useUsers] Début de la création d\'utilisateur:', userData.email);
    
    try {
      setError(null);
      const response = await userService.createUser(userData);
      
      if (response.success) {
        console.log('✅ [useUsers] Utilisateur créé avec succès, ID:', response.data?.id);
        
        showToast(
          "Succès",
          `Utilisateur "${userData.nom}" créé avec succès`
        );
        
        // IMPORTANT: Rafraîchir immédiatement la liste
        await fetchUsers(lastSearchTerm);
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur lors de la création:', errorMessage);
      
      showToast(
        "Erreur",
        "Erreur lors de la création: " + errorMessage,
        "destructive"
      );
      return false;
    }
  }, [fetchUsers, lastSearchTerm, showToast]);

  // Fonction pour mettre à jour un utilisateur
  const updateUser = useCallback(async (id: number, userData: UpdateUserData): Promise<boolean> => {
    console.log('🔄 [useUsers] Début de la mise à jour d\'utilisateur:', id);
    
    try {
      setError(null);
      const response = await userService.updateUser(id, userData);
      
      if (response.success) {
        console.log('✅ [useUsers] Utilisateur mis à jour avec succès:', id);
        
        showToast(
          "Succès",
          "Utilisateur mis à jour avec succès"
        );
        
        // IMPORTANT: Rafraîchir immédiatement la liste
        await fetchUsers(lastSearchTerm);
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur lors de la mise à jour:', errorMessage);
      
      showToast(
        "Erreur",
        "Erreur lors de la mise à jour: " + errorMessage,
        "destructive"
      );
      return false;
    }
  }, [fetchUsers, lastSearchTerm, showToast]);

  // Fonction pour supprimer un utilisateur
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    console.log('🗑️ [useUsers] Début de la suppression d\'utilisateur:', id);
    
    try {
      setError(null);
      
      // Trouver le nom de l'utilisateur pour le message
      const user = users.find(u => u.id === id);
      const userName = user?.nom || `ID ${id}`;
      
      const response = await userService.deleteUser(id);
      
      if (response.success) {
        console.log('✅ [useUsers] Utilisateur supprimé avec succès:', id);
        
        showToast(
          "Succès",
          `Utilisateur "${userName}" supprimé avec succès`
        );
        
        // IMPORTANT: Rafraîchir immédiatement la liste
        await fetchUsers(lastSearchTerm);
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur lors de la suppression:', errorMessage);
      
      showToast(
        "Erreur",
        "Erreur lors de la suppression: " + errorMessage,
        "destructive"
      );
      return false;
    }
  }, [users, fetchUsers, lastSearchTerm, showToast]);

  // Fonction pour changer le statut d'un utilisateur
  const toggleUserStatus = useCallback(async (id: number, newStatus: 'Actif' | 'Inactif'): Promise<boolean> => {
    console.log('🔄 [useUsers] Changement de statut utilisateur:', id, 'vers', newStatus);
    
    try {
      setError(null);
      
      const user = users.find(u => u.id === id);
      const userName = user?.nom || `ID ${id}`;
      
      const response = await userService.toggleUserStatus(id, newStatus);
      
      if (response.success) {
        console.log('✅ [useUsers] Statut changé avec succès:', id);
        
        showToast(
          "Succès",
          `Utilisateur "${userName}" ${newStatus === 'Actif' ? 'activé' : 'désactivé'} avec succès`
        );
        
        // IMPORTANT: Rafraîchir immédiatement la liste
        await fetchUsers(lastSearchTerm);
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors du changement de statut');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur changement de statut:', errorMessage);
      
      showToast(
        "Erreur",
        "Erreur lors du changement de statut: " + errorMessage,
        "destructive"
      );
      return false;
    }
  }, [users, fetchUsers, lastSearchTerm, showToast]);

  // Fonction pour changer le mot de passe
  const changePassword = useCallback(async (id: number, newPassword: string): Promise<boolean> => {
    console.log('🔑 [useUsers] Changement de mot de passe utilisateur:', id);
    
    if (!newPassword || newPassword.trim().length === 0) {
      showToast(
        "Erreur",
        "Le nouveau mot de passe ne peut pas être vide",
        "destructive"
      );
      return false;
    }
    
    try {
      setError(null);
      
      const user = users.find(u => u.id === id);
      const userName = user?.nom || `ID ${id}`;
      
      const response = await userService.changePassword(id, newPassword);
      
      if (response.success) {
        console.log('✅ [useUsers] Mot de passe changé avec succès:', id);
        
        showToast(
          "Succès",
          `Mot de passe de "${userName}" modifié avec succès`
        );
        
        return true; // Pas besoin de rafraîchir pour un changement de mot de passe
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ [useUsers] Erreur changement mot de passe:', errorMessage);
      
      showToast(
        "Erreur",
        "Erreur lors du changement de mot de passe: " + errorMessage,
        "destructive"
      );
      return false;
    }
  }, [users, showToast]);

  // Fonction de rafraîchissement
  const refreshUsers = useCallback(async () => {
    console.log('🔄 [useUsers] Rafraîchissement manuel des utilisateurs');
    await fetchUsers(lastSearchTerm);
  }, [fetchUsers, lastSearchTerm]);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    console.log('🚀 [useUsers] Initialisation du hook, chargement initial...');
    fetchUsers(initialSearchTerm);
  }, []); // Volontairement vide pour ne charger qu'une seule fois

  // Log des changements d'état pour debug
  useEffect(() => {
    console.log('📊 [useUsers] État mis à jour:', {
      usersCount: users.length,
      isLoading,
      hasError: !!error,
      lastSearchTerm
    });
  }, [users.length, isLoading, error, lastSearchTerm]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changePassword,
    refreshUsers,
    clearError,
  };
}

// Export des types pour utilisation externe
export type { User, CreateUserData, UpdateUserData } from '@/lib/userService';