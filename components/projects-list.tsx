// components/projects-list.tsx - Compatible avec votre architecture existante
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Target, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Euro,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { projectApi, type Project } from "@/lib/api"
import CreateProjectDialog from "./create-project-dialog"
import { useAuth, usePermissions } from "@/lib/auth"

interface ProjectsListProps {
  onSelectProject?: (project: any) => void // ✅ Prop optionnelle
}

export default function ProjectsList({ onSelectProject }: ProjectsListProps) {
  const { user } = useAuth()
  const permissions = usePermissions()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDirection, setSelectedDirection] = useState<string>("all")

  // Charger les projets
  const loadProjects = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    else setIsRefreshing(true)
    
    try {
      const response = await projectApi.getProjects()
      
      if (response.success && response.data) {
        setProjects(response.data)
      } else {
        throw new Error(response.message || "Erreur lors du chargement")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Charger les projets au montage
  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Callback appelé après création d'un projet
  const handleProjectCreated = useCallback(() => {
    loadProjects(false) // Rafraîchir sans loader
    toast({
      title: "Projet créé",
      description: "Le nouveau projet apparaît dans la liste",
    })
  }, [loadProjects])

  // Fonction pour voir les détails (compatible avec votre architecture)
  const handleViewDetails = (project: Project) => {
    // Conversion du projet API vers le format attendu
    const compatibleProject = {
      id: project.id.toString(),
      name: project.nom,
      description: project.description,
      status: project.statut_nom,
      progress: project.pourcentage_avancement,
      health: project.pourcentage_avancement >= 80 ? "Vert" : 
              project.pourcentage_avancement >= 60 ? "Orange" : "Rouge",
      chef: project.chef_projet_nom,
      budget: project.budget ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(project.budget) : "Non défini",
      direction: project.direction_nom,
      priorite: project.priorite,
      dateDebut: project.date_debut,
      dateFin: project.date_fin_prevue,
      type: "ERP", // Valeur par défaut
      code: `PRJ-${project.id}`,
      // Ajout des données API complètes pour compatibilité
      apiData: project
    }
    
    // ✅ VÉRIFICATION avant d'appeler la fonction
    if (onSelectProject && typeof onSelectProject === 'function') {
      onSelectProject(compatibleProject)
    } else {
      // ✅ FALLBACK : Afficher les détails d'une autre manière ou logger
      console.log('Projet sélectionné:', compatibleProject)
      // Vous pouvez aussi ouvrir un modal, changer de route, etc.
      
      // Exemple : redirection vers une page de détails
      // window.location.href = `/projects/${project.id}`
      
      // Ou afficher une alerte temporaire
      alert(`Projet sélectionné: ${project.nom}`)
    }
  }

  // Filtrer les projets
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.chef_projet_nom.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || project.statut_nom === selectedStatus
    const matchesDirection = selectedDirection === "all" || project.direction_nom === selectedDirection
    
    return matchesSearch && matchesStatus && matchesDirection
  })

  // Obtenir les statuts et directions uniques pour les filtres
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.statut_nom)))
  const uniqueDirections = Array.from(new Set(projects.map(p => p.direction_nom)))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "destructive"
      case "Normale": return "secondary"
      case "Faible": return "outline"
      default: return "secondary"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Haute": return "🔴"
      case "Normale": return "🟡"
      case "Faible": return "🟢"
      default: return "🟡"
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Non défini"
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des projets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} 
            {projects.length !== filteredProjects.length && ` sur ${projects.length}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadProjects(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          {permissions.canCreateProject && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Tous les statuts</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Toutes les directions</option>
            {uniqueDirections.map(direction => (
              <option key={direction} value={direction}>{direction}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Total projets</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">En cours</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.statut_nom === "En cours").length}
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
                  <p className="text-sm font-medium">Terminés</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.statut_nom === "Terminé").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Euro className="h-4 w-4 text-yellow-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">Budget total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des projets */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {projects.length === 0 ? "Aucun projet trouvé" : "Aucun projet ne correspond à vos critères"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0 
                ? "Commencez par créer votre premier projet"
                : "Essayez de modifier vos filtres de recherche"
              }
            </p>
            {projects.length === 0 && permissions.canCreateProject && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier projet
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.nom}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline"
                        style={{ 
                          backgroundColor: `${project.statut_couleur}20`,
                          borderColor: project.statut_couleur,
                          color: project.statut_couleur
                        }}
                      >
                        {project.statut_nom}
                      </Badge>
                      <Badge variant={getPriorityColor(project.priorite)}>
                        {getPriorityIcon(project.priorite)} {project.priorite}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informations projet */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Chef de projet:</span>
                    <span className="font-medium">{project.chef_projet_nom}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Direction:</span>
                    <span className="font-medium">{project.direction_nom}</span>
                  </div>
                  
                  {project.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="text-xs">
                      {formatDate(project.date_debut)} → {formatDate(project.date_fin_prevue)}
                    </span>
                  </div>
                </div>

                {/* Progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avancement</span>
                    <span>{Math.round(project.pourcentage_avancement)}%</span>
                  </div>
                  <Progress value={project.pourcentage_avancement} className="h-2" />
                </div>

                {/* Tâches */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{project.nb_taches} tâche{project.nb_taches > 1 ? 's' : ''}</span>
                  <span>
                    {Math.round(project.taches_completees_pct)}% terminées
                  </span>
                </div>

                {/* Actions - Compatible avec votre architecture */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(project)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de création */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}