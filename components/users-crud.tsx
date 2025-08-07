"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Key,
  Power,
  PowerOff,
  Eye,
  EyeOff,
  Filter,
  Download,
  Mail,
  Building2,
  Shield,
  Calendar,
  Activity
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Imports des services
import { useUsers, CreateUserData, UpdateUserData } from "@/hooks/useUsers";
import { referenceService } from "@/lib/referenceService";
import type { Direction, Role } from "@/lib/referenceService";

interface User {
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

export default function UsersCRUD() {
  // État principal
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useUsers();

  // Données de référence
  const [directions, setDirections] = useState<Direction[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // État des dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState<CreateUserData & { statut?: string }>({
    nom: "",
    email: "",
    password: "",
    role_id: 0,
    direction_id: 0,
    statut: "Actif"
  });
  
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recherche avec débounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers(searchTerm || undefined);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, fetchUsers]);

  // Charger données de référence
  const loadInitialData = async () => {
    try {
      const [dirResponse, roleResponse] = await Promise.all([
        referenceService.getDirections(),
        referenceService.getRoles()
      ]);

      if (dirResponse.success && dirResponse.data) {
        setDirections(dirResponse.data);
      }

      if (roleResponse.success && roleResponse.data) {
        setRoles(roleResponse.data);
      }

      // Charger les utilisateurs
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données de référence",
        variant: "destructive",
      });
    }
  };

  // Reset du formulaire
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
    
    // Trouver les IDs correspondants
    const userRole = roles.find(r => r.nom === user.role || r.nom === user.role_nom);
    const userDirection = directions.find(d => d.nom === user.direction || d.nom === user.direction_nom);
    
    setFormData({
      nom: user.nom,
      email: user.email,
      password: "",
      role_id: userRole?.id || 0,
      direction_id: userDirection?.id || 0,
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

  // Changer le statut d'un utilisateur
  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.statut === "Actif" ? "Inactif" : "Actif";
      
      const success = await updateUser(user.id, { statut: newStatus });
      
      if (success) {
        toast({
          title: "Succès",
          description: `Utilisateur ${newStatus === "Actif" ? "activé" : "désactivé"} avec succès`,
        });
        await refreshUsers();
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du changement de statut",
        variant: "destructive",
      });
    }
  };

  // Soumettre création
  const handleSubmitCreate = async () => {
    if (!formData.nom || !formData.email || !formData.password || !formData.role_id || !formData.direction_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await createUser({
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id,
        direction_id: formData.direction_id
      });
      
      if (success) {
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
        });
        setShowCreateDialog(false);
        resetForm();
        await refreshUsers();
      }
    } catch (error) {
      console.error("Erreur création:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumettre modification
  const handleSubmitEdit = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData: UpdateUserData = {
        nom: formData.nom,
        email: formData.email,
        role_id: formData.role_id,
        direction_id: formData.direction_id,
        statut: formData.statut
      };

      // Si un nouveau mot de passe est fourni
      if (formData.password) {
        (updateData as any).password = formData.password;
      }

      const success = await updateUser(selectedUser.id, updateData);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès",
        });
        setShowEditDialog(false);
        setSelectedUser(null);
        await refreshUsers();
      }
    } catch (error) {
      console.error("Erreur modification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmer suppression
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await deleteUser(selectedUser.id);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        });
        setShowDeleteDialog(false);
        setSelectedUser(null);
        await refreshUsers();
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Changer mot de passe
  const handleSubmitPasswordChange = async () => {
    if (!selectedUser || !newPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nouveau mot de passe",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updateUser(selectedUser.id, { 
        password: newPassword 
      } as any);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Mot de passe modifié avec succès",
        });
        setShowPasswordDialog(false);
        setSelectedUser(null);
        setNewPassword("");
      }
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.direction_nom || user.direction || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.statut === statusFilter;
    
    const userRoleId = roles.find(r => r.nom === (user.role_nom || user.role))?.id?.toString() || "";
    const matchesRole = roleFilter === "all" || userRoleId === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Utilitaires de formatage
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

  // Calculs statistiques
  const stats = {
    total: users.length,
    actifs: users.filter(u => u.statut === "Actif").length,
    inactifs: users.filter(u => u.statut === "Inactif").length,
    par_role: roles.map(role => ({
      role: role.nom,
      count: users.filter(u => (u.role_nom || u.role) === role.nom).length
    }))
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Erreur: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, leurs rôles et leurs permissions
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isLoading}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactifs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.par_role.find(r => r.role === "Administrateur fonctionnel")?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email ou direction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actifs uniquement</SelectItem>
                <SelectItem value="Inactif">Inactifs uniquement</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les rôles" />
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
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Utilisateurs ({filteredUsers.length}/{users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernier accès</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm ? "Aucun utilisateur trouvé pour cette recherche" : "Aucun utilisateur"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.nom}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(user.role_nom || user.role)}>
                            {user.role_nom || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="w-3 h-3 mr-1 text-muted-foreground" />
                            {user.direction_nom || user.direction}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(user.statut)}>
                              {user.statut}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user)}
                              className="h-6 w-6 p-0"
                            >
                              {user.statut === "Actif" ? (
                                <PowerOff className="w-3 h-3" />
                              ) : (
                                <Power className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(user.dernierAcces)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangePassword(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Key className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom *
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="col-span-3"
                placeholder="Nom complet"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mot de passe *
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rôle *
              </Label>
              <Select
                value={formData.role_id.toString()}
                onValueChange={(value) => setFormData({...formData, role_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direction" className="text-right">
                Direction *
              </Label>
              <Select
                value={formData.direction_id.toString()}
                onValueChange={(value) => setFormData({...formData, direction_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nom" className="text-right">
                Nom *
              </Label>
              <Input
                id="edit-nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Nouveau mot de passe
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Laisser vide pour ne pas changer"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rôle *
              </Label>
              <Select
                value={formData.role_id.toString()}
                onValueChange={(value) => setFormData({...formData, role_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-direction" className="text-right">
                Direction *
              </Label>
              <Select
                value={formData.direction_id.toString()}
                onValueChange={(value) => setFormData({...formData, direction_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-statut" className="text-right">
                Statut
              </Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({...formData, statut: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.nom}</strong> ?
              Cette action ne peut pas être annulée. L'utilisateur sera désactivé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Changement de mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                Nouveau mot de passe
              </Label>
              <div className="col-span-3 relative">
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitPasswordChange} disabled={isSubmitting || !newPassword}>
              {isSubmitting ? "Modification..." : "Changer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}