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
import { usePermissions } from "@/lib/auth"
import { useUsers } from "@/hooks/useUsers"
import { referenceService, Direction, Role } from "@/lib/api"
import AccessDenied from "@/components/acces-denied"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState({
    nom: "",
    email: "",
    password: "",
    role_id: "",
    direction_id: "",
  })
  const [directions, setDirections] = useState<Direction[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingReferences, setLoadingReferences] = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const permissions = usePermissions()
  const { users, loading, error, fetchUsers, createUser } = useUsers()

  // Vérification des permissions - Seuls les admins peuvent accéder
  if (!permissions.canManageUsers) {
    return (
      <AccessDenied 
        title="Gestion des Utilisateurs - Accès Réservé"
        message="La gestion des utilisateurs est réservée aux administrateurs fonctionnels."
        requiredRole="Administrateur fonctionnel"
      />
    )
  }

  // Charger les références (directions et rôles)
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingReferences(true)
        const [directionsResponse, rolesResponse] = await Promise.all([
          referenceService.getDirections(),
          referenceService.getRoles()
        ])
        
        if (directionsResponse.success) {
          setDirections(directionsResponse.data)
        }
        if (rolesResponse.success) {
          setRoles(rolesResponse.data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des références:', error)
      } finally {
        setLoadingReferences(false)
      }
    }

    loadReferences()
  }, [])

  // Recherche avec délai
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchUsers(searchTerm)
      } else {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    
    try {
      const result = await createUser({
        ...newUser,
        role_id: parseInt(newUser.role_id),
        direction_id: parseInt(newUser.direction_id)
      })
      
      if (result.success) {
        setShowCreateDialog(false)
        setNewUser({ nom: "", email: "", password: "", role_id: "", direction_id: "" })
        // Optionnel: afficher un message de succès
      } else {
        setCreateError(result.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setCreateError('Erreur de connexion au serveur')
    } finally {
      setCreateLoading(false)
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement des utilisateurs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec information admin */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les accès et permissions des utilisateurs (Admin seulement)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Alerte d'information pour l'admin */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Mode Administrateur:</strong> Vous avez accès à toutes les fonctionnalités de gestion des utilisateurs.
          Rôle actuel: <strong>{permissions.userRole}</strong>
        </AlertDescription>
      </Alert>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              onClick={() => fetchUsers()} 
              variant="outline" 
              size="sm"
              className="ml-2"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chefs de Projet</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role_nom === "Chef de Projet").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.statut === "Actif").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Chargement...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé
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
                  <TableHead>Dernier accès</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nom}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(user.role_nom)}>{user.role_nom}</Badge>
                    </TableCell>
                    <TableCell>{user.direction_nom}</TableCell>
                    <TableCell>
                      <Badge variant={user.statut === "Actif" ? "default" : "secondary"}>
                        {user.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.dernier_acces)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur au système. Tous les champs sont requis.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={newUser.nom}
                onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                placeholder="Ex: Marie Dubois"
                required
                disabled={createLoading}
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
                disabled={createLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mot de passe sécurisé (min. 6 caractères)"
                required
                minLength={6}
                disabled={createLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select 
                value={newUser.role_id} 
                onValueChange={(value) => setNewUser({ ...newUser, role_id: value })}
                disabled={createLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {loadingReferences ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
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
                value={newUser.direction_id} 
                onValueChange={(value) => setNewUser({ ...newUser, direction_id: value })}
                disabled={createLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une direction" />
                </SelectTrigger>
                <SelectContent>
                  {loadingReferences ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
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
                disabled={createLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? (
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