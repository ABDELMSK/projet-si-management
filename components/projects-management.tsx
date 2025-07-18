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
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, Search, Edit, Trash2, FolderOpen, Loader2, AlertCircle, 
  TrendingUp, Clock, CheckCircle, PauseCircle, Users, Euro 
} from "lucide-react"
import { usePermissions } from "@/lib/auth"
import { useProjects } from "@/hooks/useProjects"
import { userService, referenceService, Direction, ProjectStatus, User } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function ProjectsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newProject, setNewProject] = useState({
    nom: "",
    description: "",
    chef_projet_id: "",
    direction_id: "",
    statut_id: "",
    budget: "",
    date_debut: "",
    date_fin_prevue: "",
    priorite: "Normale"
  })
  
  // États pour les données de référence
  const [directions, setDirections] = useState<Direction[]>([])
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([])
  const [chefsProjets, setChefsProjets] = useState<User[]>([])
  const [loadingReferences, setLoadingReferences] = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const permissions = usePermissions()
  const { projects, stats, loading, error, fetchProjects, createProject, deleteProject } = useProjects()

  // Charger les données de référence
  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingReferences(true)
        const [directionsResponse, statusesResponse, usersResponse] = await Promise.all([
          referenceService.getDirections(),
          referenceService.getProjectStatuses(),
          userService.getAllUsers()
        ])
        
        if (directionsResponse.success) {
          setDirections(directionsResponse.data)
        }
        if (statusesResponse?.success) {
          setProjectStatuses(statusesResponse.data)
        }
        if (usersResponse.success) {
          // Filtrer pour ne garder que les chefs de projet et PMO
          const chefsEtPMO = usersResponse.data.filter((user: User) => 
            ['Chef de Projet', 'PMO / Directeur de projets', 'Administrateur fonctionnel'].includes(user.role_nom)
          )
          setChefsProjets(chefsEtPMO)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des références:', error)
      } finally {
        setLoadingReferences(false)
      }
    }

    loadReferences()
  }, [])

  // Recherche et filtrage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: { search?: string; status?: string } = {}
      if (searchTerm.trim()) params.search = searchTerm
      if (statusFilter !== "all") params.status = statusFilter
      
      fetchProjects(Object.keys(params).length > 0 ? params : undefined)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, fetchProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)
    
    try {
      const result = await createProject({
        ...newProject,
        chef_projet_id: parseInt(newProject.chef_projet_id),
        direction_id: parseInt(newProject.direction_id),
        statut_id: parseInt(newProject.statut_id),
        budget: newProject.budget ? parseFloat(newProject.budget) : undefined
      })
      
      if (result.success) {
        setShowCreateDialog(false)
        setNewProject({
          nom: "", description: "", chef_projet_id: "", direction_id: "", 
          statut_id: "", budget: "", date_debut: "", date_fin_prevue: "", priorite: "Normale"
        })
      } else {
        setCreateError(result.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setCreateError('Erreur de connexion au serveur')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteProject = async (id: number, nom: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${nom}" ?`)) {
      const result = await deleteProject(id)
      if (!result.success) {
        alert('Erreur: ' + result.error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours":
        return "default"
      case "Planification":
        return "secondary"
      case "Terminé":
        return "success"
      case "En pause":
        return "destructive"
      case "Annulé":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case "Critique":
        return "destructive"
      case "Haute":
        return "secondary"
      case "Normale":
        return "default"
      case "Basse":
        return "outline"
      default:
        return "default"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement des projets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Projets</h1>
          <p className="text-muted-foreground">
            {permissions.canViewAllProjects 
              ? "Gérez tous les projets de l'organisation"
              : "Gérez vos projets assignés"
            }
          </p>
        </div>
        {permissions.canCreateProject && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        )}
      </div>

      {/* Informations sur les permissions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Permissions actuelles:</strong> {permissions.userRole} - 
          {permissions.canViewAllProjects ? " Voir tous les projets" : " Voir vos projets uniquement"}
          {permissions.canCreateProject && " • Créer des projets"}
        </AlertDescription>
      </Alert>

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              onClick={() => fetchProjects()} 
              variant="outline" 
              size="sm"
              className="ml-2"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_projets}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.projets_en_cours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.projets_termines}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avancement Moyen</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(stats.avancement_moyen || 0)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
              <Euro className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.budget_total ? formatCurrency(stats.budget_total) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Planification">Planification</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="En pause">En pause</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Projets ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Chargement...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun projet trouvé
              {!permissions.canViewAllProjects && (
                <p className="text-sm mt-2">Vous ne voyez que les projets dont vous êtes chef de projet</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Chef de Projet</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Avancement</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{project.nom}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{project.chef_projet_nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.direction_nom}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(project.statut_nom)}>
                        {project.statut_nom}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(project.priorite)}>
                        {project.priorite}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={project.pourcentage_avancement} className="w-16" />
                        <span className="text-xs text-muted-foreground">
                          {project.pourcentage_avancement}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.budget ? formatCurrency(project.budget) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(project.date_fin_prevue)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {permissions.canCreateProject && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Supprimer"
                            onClick={() => handleDeleteProject(project.id, project.nom)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création de projet */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau projet au système. Les champs marqués d'un * sont requis.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du projet *</Label>
                <Input
                  id="nom"
                  value={newProject.nom}
                  onChange={(e) => setNewProject({ ...newProject, nom: e.target.value })}
                  placeholder="Ex: Migration ERP"
                  required
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chef_projet">Chef de projet *</Label>
                <Select 
                  value={newProject.chef_projet_id} 
                  onValueChange={(value) => setNewProject({ ...newProject, chef_projet_id: value })}
                  disabled={createLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un chef de projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingReferences ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : (
                      chefsProjets.map((chef) => (
                        <SelectItem key={chef.id} value={chef.id.toString()}>
                          {chef.nom} ({chef.role_nom})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select 
                  value={newProject.direction_id} 
                  onValueChange={(value) => setNewProject({ ...newProject, direction_id: value })}
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

              <div className="space-y-2">
                <Label htmlFor="statut">Statut initial *</Label>
                <Select 
                  value={newProject.statut_id} 
                  onValueChange={(value) => setNewProject({ ...newProject, statut_id: value })}
                  disabled={createLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingReferences ? (
                      <SelectItem value="loading" disabled>Chargement...</SelectItem>
                    ) : (
                      projectStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.nom}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priorite">Priorité</Label>
                <Select 
                  value={newProject.priorite} 
                  onValueChange={(value) => setNewProject({ ...newProject, priorite: value })}
                  disabled={createLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basse">Basse</SelectItem>
                    <SelectItem value="Normale">Normale</SelectItem>
                    <SelectItem value="Haute">Haute</SelectItem>
                    <SelectItem value="Critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="150000"
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de début</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={newProject.date_debut}
                  onChange={(e) => setNewProject({ ...newProject, date_debut: e.target.value })}
                  disabled={createLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_fin_prevue">Date de fin prévue</Label>
                <Input
                  id="date_fin_prevue"
                  type="date"
                  value={newProject.date_fin_prevue}
                  onChange={(e) => setNewProject({ ...newProject, date_fin_prevue: e.target.value })}
                  disabled={createLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Description détaillée du projet..."
                disabled={createLoading}
                rows={3}
              />
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
                  'Créer le projet'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}