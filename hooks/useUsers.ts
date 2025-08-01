// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

// Import explicite du service utilisateur
import userService from '@/lib/userService';

// Types locaux pour éviter les dépendances circulaires
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

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (searchTerm?: string) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUser: (id: number, userData: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
}

export function useUsers(initialSearchTerm?: string): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les utilisateurs
  const fetchUsers = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des utilisateurs...', searchTerm ? `(recherche: ${searchTerm})` : '');
      
      // Vérification de l'existence du service
      if (!userService || typeof userService.getAllUsers !== 'function') {
        throw new Error('Service utilisateur non disponible');
      }
      
      const response = await userService.getAllUsers(searchTerm);
      if (response.success && response.data) {
        console.log('✅ Utilisateurs chargés:', response.data.length);
        setUsers(response.data);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors du chargement des utilisateurs:', errorMessage);
      setError(errorMessage);
      
      // Toast seulement si disponible
      if (typeof toast === 'function') {
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour créer un utilisateur
  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    try {
      console.log('🔄 Création d\'un utilisateur:', userData.email);
      
      if (!userService || typeof userService.createUser !== 'function') {
        throw new Error('Service utilisateur non disponible');
      }
      
      const response = await userService.createUser(userData);
      if (response.success) {
        console.log('✅ Utilisateur créé avec succès');
        
        if (typeof toast === 'function') {
          toast({
            title: "Succès",
            description: "Utilisateur créé avec succès",
          });
        }
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la création:', errorMessage);
      
      if (typeof toast === 'function') {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [fetchUsers]);

  // Fonction pour mettre à jour un utilisateur
  const updateUser = useCallback(async (id: number, userData: UpdateUserData): Promise<boolean> => {
    try {
      console.log('🔄 Mise à jour de l\'utilisateur:', id);
      
      if (!userService || typeof userService.updateUser !== 'function') {
        throw new Error('Service utilisateur non disponible');
      }
      
      const response = await userService.updateUser(id, userData);
      if (response.success) {
        console.log('✅ Utilisateur mis à jour avec succès');
        
        if (typeof toast === 'function') {
          toast({
            title: "Succès",
            description: "Utilisateur mis à jour avec succès",
          });
        }
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la mise à jour:', errorMessage);
      
      if (typeof toast === 'function') {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [fetchUsers]);

  // Fonction pour supprimer un utilisateur
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      console.log('🔄 Suppression de l\'utilisateur:', id);
      
      if (!userService || typeof userService.deleteUser !== 'function') {
        throw new Error('Service utilisateur non disponible');
      }
      
      const response = await userService.deleteUser(id);
      if (response.success) {
        console.log('✅ Utilisateur supprimé avec succès');
        
        if (typeof toast === 'function') {
          toast({
            title: "Succès",
            description: "Utilisateur supprimé avec succès",
          });
        }
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la suppression:', errorMessage);
      
      if (typeof toast === 'function') {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [fetchUsers]);

  // Fonction de rafraîchissement
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers(initialSearchTerm);
  }, [fetchUsers, initialSearchTerm]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
  };
}

export default useUsers;