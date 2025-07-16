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
      dateFin: "2025-03-31",
      livrables: ["Spécifications", "Développement", "Tests"],
      pvReception: null,
    },
    {
      id: 5,
      nom: "Clôture",
      statut: "Non entamée",
      dateDebut: "2025-04-01",
      dateFin: "2025-06-30",
      livrables: ["Recette finale", "Documentation"],
      pvReception: null,
    },
  ]

  const echeancier = [
    { date: "2024-02-15", montant: "90K€", description: "Cadrage", statut: "Payé" },
    { date: "2024-05-30", montant: "135K€", description: "Contractualisation", statut: "Payé" },
    { date: "2024-09-30", montant: "150K€", description: "Exécution - Phase 1", statut: "Pas encore payé" },
    { date: "2025-03-31", montant: "75K€", description: "Exécution - Phase 2", statut: "Pas encore payé" },
  ]

  const risques = [
    {
      id: 1,
      description: "Retard dans la livraison du prestataire",
      impact: "Élevé",
      responsable: "Marie Dubois",
      statut: "Actif",
    },
    {
      id: 2,
      description: "Résistance au changement des utilisateurs",
      impact: "Moyen",
      responsable: "Pierre Martin",
      statut: "Surveillé",
    },
  ]

  const copils = [
    {
      numero: "COPIL-001",
      date: "2024-01-30",
      support: "Présentation-COPIL-001.pptx",
      compteRendu: "CR-COPIL-001.pdf",
    },
    {
      numero: "COPIL-002",
      date: "2024-03-15",
      support: "Présentation-COPIL-002.pptx",
      compteRendu: "CR-COPIL-002.pdf",
    },
  ]

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Validée":
        return "bg-green-500"
      case "En cours":
        return "bg-blue-500"
      case "Livrée":
        return "bg-orange-500"
      case "Non entamée":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
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
            <h1 className="text-2xl font-bold">{project.name}</h1>
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
                <p className="font-medium">{project.phase}</p>
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
                className={`w-3 h-3 rounded-full ${project.health === "Vert" ? "bg-green-500" : project.health === "Orange" ? "bg-orange-500" : "bg-red-500"}`}
              />
              <div>
                <p className="text-sm text-muted-foreground">État de santé</p>
                <p className="font-medium">{project.health}</p>
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
                <p className="font-medium">{project.progress}%</p>
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
                  <Input value={project.name} readOnly />
                </div>
                <div>
                  <Label>Code projet</Label>
                  <Input value={project.id} readOnly />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value="Migration complète du système ERP vers SAP S/4HANA avec formation des utilisateurs et mise en place des nouveaux processus."
                  readOnly
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type de projet</Label>
                  <Input value={project.type} readOnly />
                </div>
                <div>
                  <Label>Chef de projet</Label>
                  <Input value={project.chef} readOnly />
                </div>
                <div>
                  <Label>Direction métier</Label>
                  <Input value={project.direction} readOnly />
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Date de création</Label>
                  <Input value="2024-01-10" readOnly />
                </div>
                <div>
                  <Label>Date de démarrage administratif</Label>
                  <Input value="2024-01-15" readOnly />
                </div>
                <div>
                  <Label>Date de début prévue</Label>
                  <Input value={project.dateDebut} readOnly />
                </div>
                <div>
                  <Label>Date de fin prévue</Label>
                  <Input value={project.dateFin} readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Phases du projet</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin</TableHead>
                      <TableHead>Durée</TableHead>
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
                        <TableCell>{phase.dateDebut}</TableCell>
                        <TableCell>{phase.dateFin}</TableCell>
                        <TableCell>
                          {Math.ceil(
                            (new Date(phase.dateFin).getTime() - new Date(phase.dateDebut).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          jours
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contrats & Prestataires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Objet du marché</Label>
                  <Input value="Migration ERP SAP S/4HANA" readOnly />
                </div>
                <div>
                  <Label>Prestataire</Label>
                  <Input value="SAP Consulting France" readOnly />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type de marché</Label>
                  <Input value="Marché négocié" readOnly />
                </div>
                <div>
                  <Label>Référence du marché</Label>
                  <Input value="MN-2024-001" readOnly />
                </div>
                <div>
                  <Label>Délai d'exécution</Label>
                  <Input value="18 mois" readOnly />
                </div>
              </div>
              <div>
                <Label>Montant contractuel</Label>
                <Input value="450 000 €" readOnly />
              </div>

              <div className="space-y-2">
                <Label>Documents liés</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Contrat-SAP-2024.pdf</span>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span>Cahier-des-charges.pdf</span>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget & Finances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Budget initial</Label>
                  <Input value="450 000 €" readOnly />
                </div>
                <div>
                  <Label>Budget consommé</Label>
                  <Input value="225 000 €" readOnly />
                </div>
                <div>
                  <Label>Budget restant</Label>
                  <Input value="225 000 €" readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Progression budgétaire</Label>
                <Progress value={50} className="h-3" />
                <p className="text-sm text-muted-foreground">50% du budget consommé</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Échéancier de paiement</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {echeancier.map((echeance, index) => (
                      <TableRow key={index}>
                        <TableCell>{echeance.date}</TableCell>
                        <TableCell className="font-medium">{echeance.montant}</TableCell>
                        <TableCell>{echeance.description}</TableCell>
                        <TableCell>
                          <Badge variant={echeance.statut === "Payé" ? "default" : "secondary"}>
                            {echeance.statut}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phases & Livrables</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Livrables</TableHead>
                    <TableHead>PV Réception</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <div className="space-y-1">
                          {phase.livrables.map((livrable, idx) => (
                            <div key={idx} className="text-sm">
                              {livrable}
                            </div>
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
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Joindre
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suivi" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Suivi et Indicateurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Taux d'avancement</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={project.progress} className="flex-1" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
                <div>
                  <Label>État de santé</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-4 h-4 rounded-full ${project.health === "Vert" ? "bg-green-500" : project.health === "Orange" ? "bg-orange-500" : "bg-red-500"}`}
                    />
                    <span>{project.health}</span>
                  </div>
                </div>
                <div>
                  <Label>Actions en cours</Label>
                  <Textarea
                    value="- Finalisation des spécifications techniques&#10;- Formation des utilisateurs clés&#10;- Tests d'intégration en cours"
                    readOnly
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risques identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {risques.map((risque) => (
                    <div key={risque.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{risque.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Responsable: {risque.responsable}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={risque.impact === "Élevé" ? "destructive" : "secondary"}>
                            {risque.impact}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {risque.statut}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comitologie</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>COPIL</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Support</TableHead>
                    <TableHead>Compte rendu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {copils.map((copil, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{copil.numero}</TableCell>
                      <TableCell>{copil.date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          {copil.support}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          {copil.compteRendu}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
