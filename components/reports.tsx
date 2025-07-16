"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, TrendingUp } from "lucide-react"
import { usePermissions } from "@/lib/auth"

export default function Reports() {
  const [reportType, setReportType] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const permissions = usePermissions()

  if (!permissions.canGenerateReports) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas les permissions pour accéder aux rapports.</p>
        </div>
      </div>
    )
  }

  const indicateurs = [
    {
      titre: "Projets en cours",
      valeur: "24",
      evolution: "+3",
      couleur: "text-blue-600",
    },
    {
      titre: "Budget total engagé",
      valeur: "2.4M€",
      evolution: "+15%",
      couleur: "text-green-600",
    },
    {
      titre: "Taux de réussite",
      valeur: "87%",
      evolution: "+2%",
      couleur: "text-green-600",
    },
    {
      titre: "Délai moyen",
      valeur: "14 mois",
      evolution: "-1 mois",
      couleur: "text-orange-600",
    },
  ]

  const rapportsDisponibles = [
    {
      nom: "Rapport mensuel des projets",
      description: "Vue d'ensemble de tous les projets actifs",
      type: "mensuel",
      format: "PDF",
    },
    {
      nom: "Tableau de bord budgétaire",
      description: "Suivi des budgets et dépenses par projet",
      type: "budgetaire",
      format: "Excel",
    },
    {
      nom: "Rapport d'avancement",
      description: "État d'avancement détaillé des projets",
      type: "avancement",
      format: "PDF",
    },
    {
      nom: "Analyse des risques",
      description: "Consolidation des risques identifiés",
      type: "risques",
      format: "PDF",
    },
  ]

  const projetsParStatut = [
    { statut: "En cours", nombre: 15, pourcentage: 62.5 },
    { statut: "En attente", nombre: 5, pourcentage: 20.8 },
    { statut: "Terminé", nombre: 3, pourcentage: 12.5 },
    { statut: "Suspendu", nombre: 1, pourcentage: 4.2 },
  ]

  const budgetParDirection = [
    { direction: "DSI", budget: "1.2M€", projets: 12 },
    { direction: "Marketing", budget: "450K€", projets: 6 },
    { direction: "Finance", budget: "320K€", projets: 3 },
    { direction: "RH", budget: "280K€", projets: 2 },
    { direction: "Commercial", budget: "150K€", projets: 1 },
  ]

  const handleGenerateReport = () => {
    console.log("Génération du rapport:", { reportType, dateDebut, dateFin })
    // Ici on traiterait la génération du rapport
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapports et Indicateurs</h1>
          <p className="text-muted-foreground">Consultez les indicateurs et générez des rapports</p>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid gap-4 md:grid-cols-4">
        {indicateurs.map((indicateur, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{indicateur.titre}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${indicateur.couleur}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${indicateur.couleur}`}>{indicateur.valeur}</div>
              <p className="text-xs text-muted-foreground">{indicateur.evolution} vs mois précédent</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Génération de rapports */}
        <Card>
          <CardHeader>
            <CardTitle>Générer un rapport</CardTitle>
            <CardDescription>Créez des rapports personnalisés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type de rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {rapportsDisponibles.map((rapport) => (
                    <SelectItem key={rapport.type} value={rapport.type}>
                      {rapport.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleGenerateReport} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </CardContent>
        </Card>

        {/* Rapports disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports disponibles</CardTitle>
            <CardDescription>Téléchargez les rapports récents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rapportsDisponibles.map((rapport, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rapport.nom}</h4>
                    <p className="text-sm text-muted-foreground">{rapport.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rapport.format}</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des projets par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Pourcentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetsParStatut.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant={
                          item.statut === "En cours"
                            ? "default"
                            : item.statut === "En attente"
                              ? "secondary"
                              : item.statut === "Terminé"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {item.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.nombre}</TableCell>
                    <TableCell>{item.pourcentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Budget par direction */}
        <Card>
          <CardHeader>
            <CardTitle>Budget par direction métier</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Projets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetParDirection.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.direction}</TableCell>
                    <TableCell>{item.budget}</TableCell>
                    <TableCell>{item.projets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
