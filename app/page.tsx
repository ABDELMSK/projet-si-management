// app/page.tsx - Mise à jour avec gestion des détails de projet
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, FolderOpen, AlertTriangle, CheckCircle, Clock, Euro } from "lucide-react"
import Navigation from "@/components/navigation"
import ProjectsList from "@/components/projects-list"
import ProjectDetail from "@/components/project-detail"
import UserManagement from "@/components/user-management"
import Reports from "@/components/reports"
import { AuthProvider } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"
import SessionTimeout from "@/components/session-timeout"
import type { Project } from "@/lib/api"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const stats = [
    {
      title: "Projets actifs",
      value: "24",
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      title: "Budget total",
      value: "2.4M€",
      icon: Euro,
      color: "text-green-600",
    },
    {
      title: "Projets en retard",
      value: "3",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Taux de réussite",
      value: "87%",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  const recentProjects = [
    {
      id: "PRJ-2025-001",
      name: "Migration ERP SAP",
      status: "En cours",
      progress: 65,
      health: "Vert",
      chef: "Marie Dubois",
      budget: "450K€",
    },
    {
      id: "PRJ-2025-002",
      name: "Sécurisation Infrastructure",
      status: "En cours",
      progress: 30,
      health: "Orange",
      chef: "Pierre Martin",
      budget: "280K€",
    },
    {
      id: "PRJ-2025-003",
      name: "Développement App Mobile",
      status: "Cadrage",
      progress: 15,
      health: "Vert",
      chef: "Sophie Laurent",
      budget: "320K€",
    },
  ]

  // Fonction pour gérer l'affichage des détails d'un projet
  const handleViewProjectDetails = (projectId: number) => {
    setSelectedProjectId(projectId)
    setCurrentView("project-detail")
  }

  // Fonction pour éditer un projet
  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    // Ici vous pourriez ouvrir un dialogue d'édition
    console.log("Édition du projet:", project.nom)
  }

  // Fonction pour revenir à la liste des projets
  const handleBackToProjects = () => {
    setSelectedProjectId(null)
    setSelectedProject(null)
    setCurrentView("projects")
  }

  const renderContent = () => {
    switch (currentView) {
      case "projects":
        return (
          <ProjectsList 
            onViewDetails={handleViewProjectDetails}
            onEditProject={handleEditProject}
          />
        )
      
      case "project-detail":
        return selectedProjectId ? (
          <ProjectDetail 
            projectId={selectedProjectId}
            onBack={handleBackToProjects}
            onEdit={handleEditProject}
          />
        ) : (
          <div className="text-center py-12">
            <p>Projet non sélectionné</p>
            <Button onClick={handleBackToProjects}>Retour à la liste</Button>
          </div>
        )
      
      case "users":
        return <UserManagement />
      
      case "reports":
        return <Reports />
      
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions rapides */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-transparent" 
                    variant="outline"
                    onClick={() => setCurrentView("projects")}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Voir tous les projets
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("projects")}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Créer un nouveau projet
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("reports")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Générer un rapport
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setCurrentView("users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les utilisateurs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertes et notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>3 projets nécessitent votre attention</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>2 livrables arrivent à échéance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>5 phases validées cette semaine</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projets récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentProjects.slice(0, 3).map((project) => (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.chef}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tableau de bord détaillé */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Projets par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">En cours</span>
                      </div>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Terminés</span>
                      </div>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">En pause</span>
                      </div>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Planification</span>
                      </div>
                      <span className="text-sm font-medium">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance cette semaine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tâches terminées</span>
                      <span className="text-sm font-medium">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Livrables validés</span>
                      <span className="text-sm font-medium">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Réunions tenues</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retard moyen</span>
                      <span className="text-sm font-medium text-green-600">-2 jours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
          <main className="container mx-auto px-4 py-6">
            {renderContent()}
          </main>
          <SessionTimeout />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}