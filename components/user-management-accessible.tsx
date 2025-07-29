// components/user-management-accessible.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Users, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePermissions } from "@/lib/auth"
import { useUsers } from "@/hooks/useUsers"
import { referenceService, type Direction, type Role } from "@/lib/referenceService"

interface NewUser {
  nom: string;
  email: string;
  password: string;
  role_id: number;
  direction_id: number;
}

export default function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingReferences, setLoadingReferences] = useState(false)
  const [referencesError, setReferencesError] = useState<string | null>(null)
  const [directions, setDirections] = useState<Direction[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [newUser, setNewUser] = useState<NewUser>({
    nom: "",
    email: "",
    password: "",
    role_id: 0,
    direction_id: 0,
  })

  const permissions = usePermissions()
  const { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    createUser, 
    deleteUser 
  } = useUsers()

  // Charger les données de référence
  const loadReferences = async () => {
    setLoadingReferences(true)
    setReferencesError(null)
    
    try {
      console.log('🔄 Chargement des données de référence...')
      
      const [directionsResponse, rolesResponse] = await Promise.all([
        referenceService.getDirections(),
        referenceService.getRoles()
      ])
      
      if (directionsResponse.success && directionsResponse.data) {
        setDirections(directionsResponse.data)
        console.log('✅ Directions chargées:', directionsResponse.data.length)
      }
      
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data)
        console.log('✅ Rôles chargés:', rolesResponse.data.length)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('❌ Erreur lors du chargement des références:', errorMessage)
      setReferencesError(errorMessage)
    } finally {
      setLoadingReferences(false)
    }
  }

  // Charger les références au montage du composant
  useEffect(() => {
    if (showCreateDialog && directions.length === 0) {
      loadReferences()
    }
  }, [showCreateDialog, directions.length])

  // Filtrer les utilisateurs selon le terme de recherche
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers(searchTerm || undefined)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, fetchUsers])

  // Vérifier les permissions
  if (!permissions.canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions pour gérer les utilisateurs.
          </p>
        </div>
      </div>
    )
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!newUser.nom || !newUser.email || !newUser.password || !newUser.role_id || !newUser.direction_id) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const success = await createUser(newUser)
    if (success) {
      setShowCreateDialog(false)
      setNewUser({
        nom: "",
        email: "",
        password: "",
        role_id: 0,
        direction_id: 0,
      })
    }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      await deleteUser(userId)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Chef de Projet":
        return "default"
      case "PMO / Directeur de projets":
        return "secondary"
      case "Administrateur fonctionnel":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} 
            {users.length !== filteredUsers.length && ` sur ${users.length}`}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Total utilisateurs</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Actifs</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.statut === 'Actif').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              <div>
                <p className="text-sm font-medium">Chefs de projet</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role?.includes('Chef')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nom}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role || user.role_nom || '')}>
                        {user.role || user.role_nom}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.direction || user.direction_nom}</TableCell>
                    <TableCell>
                      <Badge variant={user.statut === 'Actif' ? 'default' : 'secondary'}>
                        {user.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.nom)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur trouvé'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création d'utilisateur avec DialogTitle explicite */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          {referencesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{referencesError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={newUser.nom}
                onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                placeholder="Ex: Marie Dubois"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="marie.dubois@entreprise.fr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mot de passe temporaire"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select 
                value={newUser.role_id.toString()} 
                onValueChange={(value) => setNewUser({ ...newUser, role_id: parseInt(value) })}
                disabled={loadingReferences}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {loadingReferences ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </SelectItem>
                  ) : (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <Select 
                value={newUser.direction_id.toString()} 
                onValueChange={(value) => setNewUser({ ...newUser, direction_id: parseInt(value) })}
                disabled={loadingReferences}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {loadingReferences ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </SelectItem>
                  ) : (
                    directions.map((direction) => (
                      <SelectItem key={direction.id} value={direction.id.toString()}>
                        {direction.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || loadingReferences}
              >
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
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}