"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye } from "lucide-react"
import CreateProjectDialog from "./create-project-dialog"
import { usePermissions } from "@/lib/auth"

interface ProjectsListProps {
  onSelectProject: (project: any) => void
}

export default function ProjectsList({ onSelectProject }: ProjectsListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const permissions = usePermissions()

  const projects = [
    {
      id: "PRJ-2025-001",
      name: "Migration ERP SAP",
      type: "ERP",
      status: "En cours",
      phase: "Exécution",
      progress: 65,
      health: "Vert",
      chef: "Marie Dubois",
      direction: "DSI",
      budget: "450K€",
      dateDebut: "2024-01-15",
      dateFin: "2025-06-30",
    },
    {
      id: "PRJ-2025-002",
      name: "Sécurisation Infrastructure",
      type: "Sécurité",
      status: "En cours",
      phase: "Contractualisation",
      progress: 30,
      health: "Orange",
      chef: "Pierre Martin",
      direction: "DSI",
      budget: "280K€",
      dateDebut: "2024-03-01",
      dateFin: "2025-08-15",
    },
    {
      id: "PRJ-2025-003",
      name: "Développement App Mobile",
      type: "Développement spécifique",
      status: "En attente",
      phase: "Cadrage",
      progress: 15,
      health: "Vert",
      chef: "Sophie Laurent",
      direction: "Marketing",
      budget: "320K€",
      dateDebut: "2024-05-01",
      dateFin: "2025-12-31",
    },
    {
      id: "PRJ-2025-004",
      name: "Migration Cloud AWS",
      type: "Migration",
      status: "Terminé",
      phase: "Clôture",
      progress: 100,
      health: "Vert",
      chef: "Thomas Durand",
      direction: "DSI",
      budget: "180K€",
      dateDebut: "2023-09-01",
      dateFin: "2024-12-15",
    },
  ]

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Vert":
        return "bg-green-500"
      case "Orange":
        return "bg-orange-500"
      case "Rouge":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "En cours":
        return "default"
      case "En attente":
        return "secondary"
      case "Terminé":
        return "outline"
      case "Suspendu":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Projets</h1>
          <p className="text-muted-foreground">Gérez tous vos projets SI</p>
        </div>
        {permissions.canCreateProject && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou code projet..."
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
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Projets ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code/Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Chef de Projet</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Avancement</TableHead>
                <TableHead>Santé</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>{project.phase}</TableCell>
                  <TableCell>{project.chef}</TableCell>
                  <TableCell className="font-medium">{project.budget}</TableCell>
                  <TableCell>
                    <div className="w-20">
                      <Progress value={project.progress} className="h-2" />
                      <div className="text-xs text-center mt-1">{project.progress}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(project.health)}`} />
                      <span className="text-sm">{project.health}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => onSelectProject(project)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
