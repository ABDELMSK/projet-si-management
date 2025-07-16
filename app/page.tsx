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

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedProject, setSelectedProject] = useState(null)

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

  const renderContent = () => {
    switch (currentView) {
      case "projects":
        return <ProjectsList onSelectProject={setSelectedProject} />
      case "project-detail":
        return <ProjectDetail project={selectedProject} onBack={() => setCurrentView("projects")} />
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

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projets récents</CardTitle>
                <CardDescription>Vue d'ensemble des projets en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge variant="outline">{project.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Chef: {project.chef}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{project.budget}</div>
                          <div className="text-xs text-muted-foreground">{project.status}</div>
                        </div>
                        <div className="w-24">
                          <Progress value={project.progress} className="h-2" />
                          <div className="text-xs text-center mt-1">{project.progress}%</div>
                        </div>
                        <Badge
                          variant={
                            project.health === "Vert"
                              ? "default"
                              : project.health === "Orange"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {project.health}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project)
                            setCurrentView("project-detail")
                          }}
                        >
                          Voir détail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" onClick={() => setCurrentView("projects")}>
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
          <main className="container mx-auto px-4 py-6">{renderContent()}</main>
          <SessionTimeout />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
