// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { userService, type User, type CreateUserData, type UpdateUserData } from '@/lib/userService';
import { toast } from '@/components/ui/use-toast';

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
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour créer un utilisateur
  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    try {
      console.log('🔄 Création d\'un utilisateur:', userData.email);
      
      const response = await userService.createUser(userData);
      if (response.success) {
        console.log('✅ Utilisateur créé avec succès');
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
        });
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la création:', errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers]);

  // Fonction pour mettre à jour un utilisateur
  const updateUser = useCallback(async (id: number, userData: UpdateUserData): Promise<boolean> => {
    try {
      console.log('🔄 Mise à jour de l\'utilisateur:', id);
      
      const response = await userService.updateUser(id, userData);
      if (response.success) {
        console.log('✅ Utilisateur mis à jour avec succès');
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la mise à jour:', errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers]);

  // Fonction pour supprimer un utilisateur
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    try {
      console.log('🔄 Suppression de l\'utilisateur:', id);
      
      const response = await userService.deleteUser(id);
      if (response.success) {
        console.log('✅ Utilisateur supprimé avec succès');
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
        
        // Rafraîchir la liste
        await fetchUsers();
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur lors de la suppression:', errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
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