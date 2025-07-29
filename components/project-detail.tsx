"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Download, Upload, Calendar, Euro, CheckCircle } from "lucide-react"

interface ProjectDetailProps {
  project: any
  onBack: () => void
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("general")

  if (!project) return null

  const phases = [
    {
      id: 1,
      nom: "Cadrage",
      statut: "Validée",
      dateDebut: "2024-01-15",
      dateFin: "2024-02-15",
      livrables: ["Cahier des charges", "Étude de faisabilité"],
      pvReception: "PV-001.pdf",
    },
    {
      id: 2,
      nom: "Consultation/Appel d'offre",
      statut: "Validée",
      dateDebut: "2024-02-16",
      dateFin: "2024-04-15",
      livrables: ["Dossier consultation", "Grille d'évaluation"],
      pvReception: "PV-002.pdf",
    },
    {
      id: 3,
      nom: "Contractualisation",
      statut: "En cours",
      dateDebut: "2024-04-16",
      dateFin: "2024-05-30",
      livrables: ["Contrat signé", "Planning détaillé"],
      pvReception: null,
    },
    {
      id: 4,
      nom: "Exécution",
      statut: "Non entamée",
      dateDebut: "2024-06-01",
      dateFin: "2024-12-31",
      livrables: ["Système déployé", "Formation utilisateurs"],
      pvReception: null,
    },
  ]

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Validée":
        return "bg-green-500"
      case "En cours":
        return "bg-blue-500"
      case "Non entamée":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

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
            <h1 className="text-2xl font-bold">{project.name || project.nom}</h1>
            <p className="text-muted-foreground">{project.id}</p>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Phase actuelle</p>
                <p className="font-medium">{project.phase || project.statut_nom}</p>
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
                <p className="font-medium">{project.budget}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  project.health === "Vert" ? "bg-green-500" : 
                  project.health === "Orange" ? "bg-orange-500" : "bg-red-500"
                }`}
              />
              <div>
                <p className="text-sm text-muted-foreground">État de santé</p>
                <p className="font-medium">{project.health || "Vert"}</p>
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
                <p className="font-medium">{project.progress || project.pourcentage_avancement || 0}%</p>
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
          <TabsTrigger value="contrats">Contrats</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
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
                  <Input value={project.name || project.nom} readOnly />
                </div>
                <div>
                  <Label>Code projet</Label>
                  <Input value={project.id} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chef de projet</Label>
                  <Input value={project.chef || project.chef_projet_nom} readOnly />
                </div>
                <div>
                  <Label>Direction</Label>
                  <Input value={project.direction || project.direction_nom} readOnly />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={project.description || `Description du projet ${project.name || project.nom}`}
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
                  <Input value={formatDate(project.dateDebut || project.date_debut || "2024-01-15")} readOnly />
                </div>
                <div>
                  <Label>Date de fin prévue</Label>
                  <Input value={formatDate(project.dateFin || project.date_fin_prevue || "2025-06-30")} readOnly />
                </div>
              </div>
              <div>
                <Label>Avancement global</Label>
                <div className="mt-2">
                  <Progress value={project.progress || project.pourcentage_avancement || 0} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.progress || project.pourcentage_avancement || 0}% complété
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phases du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <thead>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date début</TableHead>
                    <TableHead>Date fin</TableHead>
                    <TableHead>Livrables</TableHead>
                    <TableHead>PV Réception</TableHead>
                  </TableRow>
                </thead>
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
                      <TableCell>{formatDate(phase.dateDebut)}</TableCell>
                      <TableCell>{formatDate(phase.dateFin)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {phase.livrables.map((livrable, index) => (
                            <div key={index} className="text-sm">{livrable}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {phase.pvReception ? (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            {phase.pvReception}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">En attente</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  <Input value={project.budget || "450 000€"} readOnly />
                </div>
                <div>
                  <Label>Budget consommé</Label>
                  <Input value="180 000€" readOnly />
                </div>
                <div>
                  <Label>Budget restant</Label>
                  <Input value="270 000€" readOnly />
                </div>
              </div>
              <div>
                <Label>Consommation budgétaire</Label>
                <div className="mt-2">
                  <Progress value={40} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">40% du budget consommé</p>
                </div>
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
                  <h4 className="font-semibold mb-2">Dernières activités</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-muted-foreground">Il y a 2 jours</span>
                      <span>Phase de contractualisation validée</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-muted-foreground">Il y a 1 semaine</span>
                      <span>Réunion de suivi avec l'équipe projet</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-muted-foreground">Il y a 2 semaines</span>
                      <span>Mise à jour du planning</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contrats et fournisseurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Informations contractuelles à venir...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}