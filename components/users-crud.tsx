import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Search, Edit, Trash2, Users, Loader2, AlertCircle, RefreshCw,
  Mail, Shield, Building, UserCheck, UserX, Eye, EyeOff
} from 'lucide-react';

// Types pour les utilisateurs
interface User {
  id: number;
  nom: string;
  email: string;
  role_id: number;
  role_nom: string;
  direction_id: number;
  direction_nom: string;
  statut: 'Actif' | 'Inactif';
  derniere_connexion?: string;
  created_at: string;
}

interface Direction {
  id: number;
  nom: string;
}

interface Role {
  id: number;
  nom: string;
  permissions: string;
}

// Données de démonstration
const mockUsers: User[] = [
  {
    id: 1,
    nom: "Marie Dubois",
    email: "marie.dubois@entreprise.fr",
    role_id: 2,
    role_nom: "Chef de Projet",
    direction_id: 1,
    direction_nom: "DSI",
    statut: "Actif",
    derniere_connexion: "2024-07-30T10:30:00",
    created_at: "2024-01-15T09:00:00"
  },
  {
    id: 2,
    nom: "Pierre Martin",
    email: "pierre.martin@entreprise.fr",
    role_id: 3,
    role_nom: "PMO / Directeur de projets",
    direction_id: 1,
    direction_nom: "DSI",
    statut: "Actif",
    derniere_connexion: "2024-07-29T16:45:00",
    created_at: "2024-01-10T14:30:00"
  },
  {
    id: 3,
    nom: "Sophie Laurent",
    email: "sophie.laurent@entreprise.fr",
    role_id: 2,
    role_nom: "Chef de Projet",
    direction_id: 2,
    direction_nom: "Finance",
    statut: "Actif",
    derniere_connexion: "2024-07-28T11:20:00",
    created_at: "2024-02-01T10:00:00"
  },
  {
    id: 4,
    nom: "Thomas Durand",
    email: "thomas.durand@entreprise.fr",
    role_id: 1,
    role_nom: "Administrateur fonctionnel",
    direction_id: 1,
    direction_nom: "DSI",
    statut: "Actif",
    derniere_connexion: "2024-07-30T08:15:00",
    created_at: "2023-12-01T09:00:00"
  }
];

const mockDirections: Direction[] = [
  { id: 1, nom: "DSI" },
  { id: 2, nom: "Finance" },
  { id: 3, nom: "RH" },
  { id: 4, nom: "Marketing" },
  { id: 5, nom: "Commercial" }
];

const mockRoles: Role[] = [
  { id: 1, nom: "Administrateur fonctionnel", permissions: "all" },
  { id: 2, nom: "Chef de Projet", permissions: "projects:read,projects:update" },
  { id: 3, nom: "PMO / Directeur de projets", permissions: "projects:all,users:read" },
  { id: 4, nom: "Utilisateur", permissions: "projects:read" }
];

export default function UsersCRUD() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [directions] = useState<Direction[]>(mockDirections);
  const [roles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    role_id: 0,
    direction_id: 0,
    statut: "Actif" as const
  });
  
  const [newPassword, setNewPassword] = useState("");

  // Reset form
  const resetForm = () => {
    setFormData({
      nom: "",
      email: "",
      password: "",
      role_id: 0,
      direction_id: 0,
      statut: "Actif"
    });
    setNewPassword("");
    setShowPassword(false);
  };

  // Ouvrir dialog de création
  const handleCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  // Ouvrir dialog d'édition
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nom: user.nom,
      email: user.email,
      password: "",
      role_id: user.role_id,
      direction_id: user.direction_id,
      statut: user.statut
    });
    setShowEditDialog(true);
  };

  // Ouvrir dialog de suppression
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  // Ouvrir dialog de changement de mot de passe
  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPasswordDialog(true);
  };

  // Toggle statut utilisateur
  const handleToggleStatus = async (user: User) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newStatus = user.statut === "Actif" ? "Inactif" : "Actif";
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, statut: newStatus }
          : u
      ));
    } catch (error) {
      console.error("Erreur toggle status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Soumettre création
  const handleSubmitCreate = async () => {
    if (!formData.nom || !formData.email || !formData.password) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        nom: formData.nom,
        email: formData.email,
        role_id: formData.role_id,
        role_nom: roles.find(r => r.id === formData.role_id)?.nom || "",
        direction_id: formData.direction_id,
        direction_nom: directions.find(d => d.id === formData.direction_id)?.nom || "",
        statut: formData.statut,
        created_at: new Date().toISOString()
      };
      
      setUsers([...users, newUser]);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error("Erreur création:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Soumettre modification
  const handleSubmitEdit = async () => {
    if (!selectedUser || !formData.nom || !formData.email) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...selectedUser,
        nom: formData.nom,
        email: formData.email,
        role_id: formData.role_id,
        role_nom: roles.find(r => r.id === formData.role_id)?.nom || "",
        direction_id: formData.direction_id,
        direction_nom: directions.find(d => d.id === formData.direction_id)?.nom || "",
        statut: formData.statut
      };
      
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur modification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer suppression
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Changer mot de passe
  const handleSubmitPasswordChange = async () => {
    if (!selectedUser || !newPassword) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Dans la vraie app, on ferait l'appel API ici
      setShowPasswordDialog(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.direction_nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.statut === statusFilter;
    const matchesRole = roleFilter === "all" || user.role_id.toString() === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Formatage
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Jamais";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrateur fonctionnel": return "destructive";
      case "PMO / Directeur de projets": return "default";
      case "Chef de Projet": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Actif" ? "default" : "secondary";
  };

  // Statistiques
  const stats = {
    total: users.length,
    actifs: users.filter(u => u.statut === "Actif").length,
    inactifs: users.filter(u => u.statut === "Inactif").length,
    admins: users.filter(u => u.role_nom === "Administrateur fonctionnel").length
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{stats.actifs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs inactifs</p>
                <p className="text-2xl font-bold">{stats.inactifs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils et filtres */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Utilisateurs
              </CardTitle>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actifs</SelectItem>
                <SelectItem value="Inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des utilisateurs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Utilisateur</th>
                  <th className="text-left p-4 font-medium">Rôle</th>
                  <th className="text-left p-4 font-medium">Direction</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Dernière connexion</th>
                  <th className="text-left p-4 font-medium">Créé le</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.nom}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getRoleColor(user.role_nom)}>
                        {user.role_nom}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {user.direction_nom}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        disabled={isLoading}
                        className="p-0"
                      >
                        <Badge variant={getStatusColor(user.statut)}>
                          {user.statut}
                        </Badge>
                      </Button>
                    </td>
                    <td className="p-4 text-sm">
                      {formatDate(user.derniere_connexion)}
                    </td>
                    <td className="p-4 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangePassword(user)}
                          title="Changer le mot de passe"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Marie Dubois"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marie.dubois@entreprise.fr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select 
                value={formData.role_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <Select 
                value={formData.direction_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, direction_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {directions.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id.toString()}>
                      {direction.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer l\'utilisateur'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom-edit">Nom complet *</Label>
              <Input
                id="nom-edit"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-edit">Email *</Label>
              <Input
                id="email-edit"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role-edit">Rôle *</Label>
              <Select 
                value={formData.role_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction-edit">Direction *</Label>
              <Select 
                value={formData.direction_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, direction_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {directions.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id.toString()}>
                      {direction.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut-edit">Statut *</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(value) => setFormData({ ...formData, statut: value as "Actif" | "Inactif" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog changement mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Nouveau mot de passe pour {selectedUser?.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe *</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitPasswordChange} 
              disabled={isLoading || !newPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Changer le mot de passe'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{selectedUser?.nom}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}