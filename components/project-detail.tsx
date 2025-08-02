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
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Upload, 
  Calendar, 
  Euro, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Target
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { projectApi, type Project } from "@/lib/api"
import { phaseService, type Phase } from "@/lib/services/phaseService"

interface ProjectDetailProps {
  projectId: number
  onBack: () => void
  onEdit?: (project: Project) => void
}

export default function ProjectDetail({ projectId, onBack, onEdit }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [project, setProject] = useState<Project | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [isLoadingPhases, setIsLoadingPhases] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  useEffect(() => {
    const loadPhases = async () => {
      try {
        setIsLoadingPhases(true)
        
        const response = await phaseService.getProjectPhases(projectId)
        
        if (response.success && response.data) {
          setPhases(response.data)
        } else {
          console.warn("Aucune phase trouvée pour ce projet")
          setPhases([])
        }
      } catch (err) {
        console.error("Erreur chargement phases:", err)
        setPhases([])
        toast({
          title: "Attention",
          description: "Impossible de charger les phases du projet",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPhases(false)
      }
    }

    if (projectId) {
      loadPhases()
    }
  }, [projectId])

  // Fonctions utilitaires
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const calculateBudgetConsumed = () => {
    if (!project?.budget || !project?.budget_consomme) return 0
    return Math.round((project.budget_consomme / project.budget) * 100)
  }

  // État de chargement
  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  // État d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Projet non trouvé</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculer l'état de santé basé sur l'avancement
  const healthStatus = project.pourcentage_avancement >= 80 ? "Vert" : 
                      project.pourcentage_avancement >= 60 ? "Orange" : "Rouge"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.nom}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusBadgeVariant(project.statut_nom)}>
                {project.statut_nom}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Code: {project.code}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(project)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avancement</p>
                <p className="font-medium">{Math.round(project.pourcentage_avancement)}%</p>
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

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom du projet</Label>
                  <Input value={project.nom} readOnly />
                </div>
                <div>
                  <Label>Code projet</Label>
                  <Input value={project.code} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chef de projet</Label>
                  <Input value={project.chef_projet_nom || "Non assigné"} readOnly />
                </div>
                <div>
                  <Label>Direction</Label>
                  <Input value={project.direction_nom || "Non définie"} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priorité</Label>
                  <Input value={project.priorite || "Normale"} readOnly />
                </div>
                <div>
                  <Label>Statut</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(project.statut_nom)}>
                      {project.statut_nom}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={project.description || "Aucune description disponible"}
                  readOnly
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planning du projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Input value={formatDate(project.date_debut)} readOnly />
                </div>
                <div>
                  <Label>Date de fin prévue</Label>
                  <Input value={formatDate(project.date_fin_prevue)} readOnly />
                </div>
              </div>
              <div>
                <Label>Avancement global</Label>
                <div className="mt-2">
                  <Progress value={project.pourcentage_avancement} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(project.pourcentage_avancement)}% complété
                  </p>
                </div>
              </div>
              {project.date_fin_reelle && (
                <div>
                  <Label>Date de fin réelle</Label>
                  <Input value={formatDate(project.date_fin_reelle)} readOnly />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Phases du projet</span>
                {isLoadingPhases && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPhases ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : phases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin prévue</TableHead>
                      <TableHead>Avancement</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Livrables</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map((phase) => (
                      <TableRow key={phase.id}>
                        <TableCell className="font-medium">{phase.nom}</TableCell>
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
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{phase.nb_livrables || 0}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucune phase définie</h3>
                  <p className="text-sm text-muted-foreground">
                    Les phases de ce projet n'ont pas encore été créées.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations budgétaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Budget initial</Label>
                  <Input value={formatCurrency(project.budget)} readOnly />
                </div>
                <div>
                  <Label>Budget consommé</Label>
                  <Input value={formatCurrency(project.budget_consomme)} readOnly />
                </div>
                <div>
                  <Label>Budget restant</Label>
                  <Input 
                    value={formatCurrency((project.budget || 0) - (project.budget_consomme || 0))} 
                    readOnly 
                  />
                </div>
              </div>
              {project.budget && (
                <div>
                  <Label>Consommation budgétaire</Label>
                  <div className="mt-2">
                    <Progress value={calculateBudgetConsumed()} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {calculateBudgetConsumed()}% du budget consommé
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contrats et prestataires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Fonctionnalité en cours de développement</h3>
                <p className="text-sm text-muted-foreground">
                  La gestion des contrats sera bientôt disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suivi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suivi du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations de suivi</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Créé le:</span>
                      <p className="font-medium">{formatDate(project.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dernière modification:</span>
                      <p className="font-medium">{formatDate(project.updated_at)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Activités récentes</h4>
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Le suivi d'activité sera bientôt disponible
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}