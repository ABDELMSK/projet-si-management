"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Upload, 
  Calendar as CalendarIcon, 
  Euro, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Target,
  Plus,
  Trash2,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { projectApi, type Project } from "@/lib/api"
import { phaseService, type Phase } from "@/lib/services/phaseService"
import { referenceService } from "@/lib/api"
import { format } from "date-fns"

interface ProjectDetailProps {
  projectId: number
  onBack: () => void
  onEdit?: (project: Project) => void
}

interface PhaseFormData {
  nom: string
  description: string
  date_debut: string
  date_fin_prevue: string
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'En pause' | 'Annulée'
  responsable_id?: number
  budget_alloue?: number
  ordre: number
}

export default function ProjectDetail({ projectId, onBack, onEdit }: ProjectDetailProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [isLoadingPhases, setIsLoadingPhases] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // État pour la gestion des phases
  const [showPhaseDialog, setShowPhaseDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null)
  const [phaseFormData, setPhaseFormData] = useState<PhaseFormData>({
    nom: '',
    description: '',
    date_debut: '',
    date_fin_prevue: '',
    statut: 'Planifiée',
    responsable_id: undefined,
    budget_alloue: undefined,
    ordre: 1
  })

  // État pour les calendriers
  const [dateDebut, setDateDebut] = useState<Date>()
  const [dateFin, setDateFin] = useState<Date>()
  const [showDateDebutPicker, setShowDateDebutPicker] = useState(false)
  const [showDateFinPicker, setShowDateFinPicker] = useState(false)

  // Charger les utilisateurs (pour les responsables)
  useEffect(() => {
    const loadUtilisateurs = async () => {
      // Vérifier si l'utilisateur est connecté
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        console.warn('❌ Aucun token d\'authentification trouvé')
        return
      }

      try {
        const response = await referenceService.getChefsProjets()
        if (response.success && response.data) {
          setUtilisateurs(response.data || [])
        }
      } catch (err) {
        console.error("Erreur chargement utilisateurs:", err)
      }
    }
    loadUtilisateurs()
  }, [])

  // Charger les détails du projet
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoadingProject(true)
        setError(null)
        
        const response = await projectApi.getProjectById(projectId)
        
        if (response.success && response.data) {
          setProject(response.data)
        } else {
          throw new Error(response.message || "Erreur lors du chargement du projet")
        }
      } catch (err) {
        console.error("Erreur chargement projet:", err)
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du projet")
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du projet",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProject(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  // Charger les phases du projet
  const loadPhases = async () => {
    // Vérifier si l'utilisateur est connecté
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.warn('❌ Aucun token d\'authentification trouvé')
      setPhases([])
      return
    }

    try {
      setIsLoadingPhases(true)
      
      const response = await phaseService.getProjectPhases(projectId)
      
      if (response.success && response.data) {
        setPhases(response.data.sort((a, b) => a.ordre - b.ordre))
      } else {
        console.warn("Aucune phase trouvée pour ce projet")
        setPhases([])
      }
    } catch (err) {
      console.error("Erreur chargement phases:", err)
      setPhases([])
    } finally {
      setIsLoadingPhases(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      loadPhases()
    }
  }, [projectId])

  // Réinitialiser le formulaire de phase
  const resetPhaseForm = () => {
    setPhaseFormData({
      nom: '',
      description: '',
      date_debut: '',
      date_fin_prevue: '',
      statut: 'Planifiée',
      responsable_id: undefined,
      budget_alloue: undefined,
      ordre: phases.length + 1
    })
    setDateDebut(undefined)
    setDateFin(undefined)
    setEditingPhase(null)
  }

  // Ouvrir le dialog d'ajout de phase
  const handleAddPhase = () => {
    resetPhaseForm()
    setPhaseFormData(prev => ({ ...prev, ordre: phases.length + 1 }))
    setShowPhaseDialog(true)
  }

  // Ouvrir le dialog d'édition de phase
  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase)
    setPhaseFormData({
      nom: phase.nom,
      description: phase.description || '',
      date_debut: phase.date_debut || '',
      date_fin_prevue: phase.date_fin_prevue || '',
      statut: phase.statut,
      responsable_id: phase.responsable_id,
      budget_alloue: phase.budget_alloue,
      ordre: phase.ordre
    })
    setDateDebut(phase.date_debut ? new Date(phase.date_debut) : undefined)
    setDateFin(phase.date_fin_prevue ? new Date(phase.date_fin_prevue) : undefined)
    setShowPhaseDialog(true)
  }

  // Sauvegarder une phase (création ou modification)
  const handleSavePhase = async () => {
    if (!phaseFormData.nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la phase est obligatoire",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Debug - afficher les données
      console.log('🔍 Debug - Données de phase:', phaseFormData)
      console.log('🔍 Debug - Project ID:', projectId)
      
      // ✅ CORRECTION: Convertir undefined en null pour MySQL
      const formDataWithDates = {
        nom: phaseFormData.nom,
        description: phaseFormData.description || null,
        date_debut: dateDebut ? format(dateDebut, 'yyyy-MM-dd') : null,
        date_fin_prevue: dateFin ? format(dateFin, 'yyyy-MM-dd') : null,
        statut: phaseFormData.statut,
        ordre: phaseFormData.ordre,
        budget_alloue: phaseFormData.budget_alloue || null,
        responsable_id: phaseFormData.responsable_id || null,
        pourcentage_avancement: 0 // Par défaut pour une nouvelle phase
      }
      
      console.log('🔍 Debug - Données nettoyées:', formDataWithDates)

      if (editingPhase) {
        // Modification
        await phaseService.updatePhase(editingPhase.id, formDataWithDates)
        toast({
          title: "Succès",
          description: "Phase modifiée avec succès",
        })
      } else {
        // Création
        console.log('🔄 Tentative de création phase...')
        const response = await phaseService.createPhase(projectId, formDataWithDates)
        console.log('✅ Réponse création:', response)
        toast({
          title: "Succès",
          description: "Phase créée avec succès",
        })
      }

      setShowPhaseDialog(false)
      resetPhaseForm()
      loadPhases() // Recharger la liste des phases
    } catch (error) {
      console.error("❌ Erreur sauvegarde phase:", error)
      
      // Debug - plus d'infos sur l'erreur
      if (error instanceof Error) {
        console.error("❌ Message d'erreur:", error.message)
        console.error("❌ Stack trace:", error.stack)
      }
      
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder la phase",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmer la suppression d'une phase
  const handleDeletePhase = (phase: Phase) => {
    setPhaseToDelete(phase)
    setShowDeleteDialog(true)
  }

  // Supprimer une phase
  const confirmDeletePhase = async () => {
    if (!phaseToDelete) return

    setIsSubmitting(true)
    try {
      await phaseService.deletePhase(phaseToDelete.id)
      toast({
        title: "Succès",
        description: "Phase supprimée avec succès",
      })
      setShowDeleteDialog(false)
      setPhaseToDelete(null)
      loadPhases() // Recharger la liste des phases
    } catch (error) {
      console.error("Erreur suppression phase:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la phase",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Vérifier si l'utilisateur peut modifier les phases
  const canManagePhases = () => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
    const isChefProjet = user.role_nom === 'Chef de Projet' && project?.chef_projet_id === user.id
    const isAdmin = ['Administrateur fonctionnel', 'PMO / Directeur de projets'].includes(user.role_nom)
    return isChefProjet || isAdmin
  }

  // Fonctions utilitaires (gardées du code original)
  const getStatusColor = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "terminée":
      case "validée":
        return "bg-green-500"
      case "en cours":
        return "bg-blue-500"
      case "planifiée":
      case "non entamée":
        return "bg-gray-400"
      case "en pause":
        return "bg-orange-500"
      case "annulée":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusBadgeVariant = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "terminé":
      case "validée":
        return "default"
      case "en cours":
        return "secondary"
      case "en pause":
        return "outline"
      case "annulé":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case "vert":
        return "bg-green-500"
      case "orange":
        return "bg-orange-500"
      case "rouge":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non défini"
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Non défini"
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculer l'état de santé du projet
  const healthStatus = project ? 
    project.pourcentage_avancement >= 80 ? "Vert" : 
    project.pourcentage_avancement >= 60 ? "Orange" : "Rouge" : "Inconnu"

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Projet non trouvé"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.nom}</h1>
            <p className="text-sm text-muted-foreground">
              Code: PRJ-{project.id} • Direction: {project.direction_nom}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Cards de résumé */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(project.statut_nom)}>
                {project.statut_nom}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">{formatCurrency(project.budget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Chef de projet</p>
                <p className="font-medium">{project.chef_projet_nom || "Non assigné"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(healthStatus)}`} />
              <div>
                <p className="text-sm text-muted-foreground">État de santé</p>
                <p className="font-medium">{healthStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="phases">
            Phases {phases.length > 0 && <span className="ml-1">({phases.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="contrats">Contrats</TabsTrigger>
          <TabsTrigger value="suivi">Suivi</TabsTrigger>
        </TabsList>

        {/* Onglet Phases avec gestion */}
        <TabsContent value="phases" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Phases du projet ({phases.length})
            </h3>
            {canManagePhases() && (
              <Button onClick={handleAddPhase}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une phase
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoadingPhases ? (
                <div className="space-y-3 p-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : phases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordre</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin prévue</TableHead>
                      <TableHead>Avancement</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Budget</TableHead>
                      {canManagePhases() && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map((phase) => (
                      <TableRow key={phase.id}>
                        <TableCell className="font-mono text-sm">{phase.ordre}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{phase.nom}</div>
                            {phase.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {phase.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(phase.statut)}`} />
                            <span>{phase.statut}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(phase.date_debut)}</TableCell>
                        <TableCell>{formatDate(phase.date_fin_prevue)}</TableCell>
                        <TableCell>
                          <div className="w-20">
                            <Progress value={phase.pourcentage_avancement} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(phase.pourcentage_avancement)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{phase.responsable_nom || "Non assigné"}</TableCell>
                        <TableCell>{formatCurrency(phase.budget_alloue)}</TableCell>
                        {canManagePhases() && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditPhase(phase)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePhase(phase)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucune phase définie</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Les phases de ce projet n'ont pas encore été créées.
                  </p>
                  {canManagePhases() && (
                    <Button onClick={handleAddPhase}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer la première phase
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autres onglets (gardés du code original) */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{project.description || "Aucune description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priorité</Label>
                  <Badge variant="outline" className="mt-1">
                    {project.priorite}
                  </Badge>
                </div>
                <div>
                  <Label>Avancement</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={project.pourcentage_avancement} className="flex-1" />
                    <span className="text-sm font-medium">
                      {Math.round(project.pourcentage_avancement)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planning du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <p className="text-sm mt-1">{formatDate(project.date_debut)}</p>
                </div>
                <div>
                  <Label>Date de fin prévue</Label>
                  <p className="text-sm mt-1">{formatDate(project.date_fin_prevue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autres onglets peuvent être ajoutés ici */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats">
          <Card>
            <CardHeader>
              <CardTitle>Contrats associés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suivi">
          <Card>
            <CardHeader>
              <CardTitle>Suivi du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour créer/modifier une phase */}
      <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhase ? 'Modifier la phase' : 'Nouvelle phase'}
            </DialogTitle>
            <DialogDescription>
              {editingPhase 
                ? 'Modifiez les informations de la phase'
                : 'Ajoutez une nouvelle phase au projet'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la phase *</Label>
                <Input
                  id="nom"
                  value={phaseFormData.nom}
                  onChange={(e) => setPhaseFormData({ ...phaseFormData, nom: e.target.value })}
                  placeholder="Ex: Analyse des besoins"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ordre">Ordre</Label>
                <Input
                  id="ordre"
                  type="number"
                  value={phaseFormData.ordre}
                  onChange={(e) => setPhaseFormData({ ...phaseFormData, ordre: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={phaseFormData.description}
                onChange={(e) => setPhaseFormData({ ...phaseFormData, description: e.target.value })}
                rows={3}
                placeholder="Décrivez les objectifs et activités de cette phase..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover open={showDateDebutPicker} onOpenChange={setShowDateDebutPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateDebut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateDebut ? format(dateDebut, "dd/MM/yyyy") : "Sélectionnez une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateDebut}
                      onSelect={(date) => {
                        setDateDebut(date)
                        setShowDateDebutPicker(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de fin prévue</Label>
                <Popover open={showDateFinPicker} onOpenChange={setShowDateFinPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFin && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFin ? format(dateFin, "dd/MM/yyyy") : "Sélectionnez une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFin}
                      onSelect={(date) => {
                        setDateFin(date)
                        setShowDateFinPicker(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={phaseFormData.statut} 
                  onValueChange={(value) => setPhaseFormData({ 
                    ...phaseFormData, 
                    statut: value as PhaseFormData['statut']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planifiée">Planifiée</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                    <SelectItem value="Terminée">Terminée</SelectItem>
                    <SelectItem value="En pause">En pause</SelectItem>
                    <SelectItem value="Annulée">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Select 
                  value={phaseFormData.responsable_id?.toString() || "none"} 
                  onValueChange={(value) => setPhaseFormData({ 
                    ...phaseFormData, 
                    responsable_id: value === "none" ? undefined : parseInt(value) 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun responsable</SelectItem>
                    {utilisateurs.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget alloué (€)</Label>
              <Input
                id="budget"
                type="number"
                value={phaseFormData.budget_alloue || ""}
                onChange={(e) => setPhaseFormData({ 
                  ...phaseFormData, 
                  budget_alloue: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowPhaseDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSavePhase} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPhase ? 'Mettre à jour' : 'Créer la phase'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la phase "{phaseToDelete?.nom}" ?
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeletePhase} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}