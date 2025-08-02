"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Plus, Edit, Trash2, Calendar, Users, FileText, Package, 
  Upload, Download, CheckCircle, Clock, AlertCircle, Building,
  Euro, Paperclip, Eye, EyeOff, Loader2, RefreshCw
} from 'lucide-react';

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [phases, setPhases] = useState<any[]>([]);
  const [livrables, setLivrables] = useState<any[]>([]);
  const [contrats, setContrats] = useState<any[]>([]);
  const [prestataires, setPrestataires] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any>(null);

  // Données de démonstration pour les phases
  const mockPhases = [
    {
      id: 1,
      nom: "Cadrage",
      description: "Phase de cadrage et définition des besoins",
      statut: "Terminée",
      date_debut: "2024-01-15",
      date_fin_prevue: "2024-02-15",
      pourcentage_avancement: 100,
      budget_alloue: 25000,
      responsable_nom: "Marie Dubois"
    },
    {
      id: 2,
      nom: "Consultation",
      description: "Consultation des prestataires",
      statut: "En cours",
      date_debut: "2024-02-16",
      date_fin_prevue: "2024-04-15",
      pourcentage_avancement: 60,
      budget_alloue: 15000,
      responsable_nom: "Pierre Martin"
    },
    {
      id: 3,
      nom: "Contractualisation",
      description: "Signature des contrats",
      statut: "Planifiée",
      date_debut: "2024-04-16",
      date_fin_prevue: "2024-05-30",
      pourcentage_avancement: 0,
      budget_alloue: 5000,
      responsable_nom: "Marie Dubois"
    }
  ];

  // Charger les données (remplacez par vos vrais appels API)
  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhases(mockPhases);
      setLivrables([]);
      setContrats([]);
      setPrestataires([]);
      setDocuments([]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project) {
      loadProjectData();
    }
  }, [project]);

  // Fonctions utilitaires
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Terminée': return 'bg-green-500';
      case 'En cours': return 'bg-blue-500';
      case 'Planifiée': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Non défini";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Aucun projet sélectionné</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des détails du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du projet */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.name || project.nom}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadProjectData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Indicateurs rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge>{project.status || project.statut_nom}</Badge>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  project.health === "Vert" ? "bg-green-500" : 
                  project.health === "Orange" ? "bg-orange-500" : "bg-red-500"
                }`} />
                <div>
                  <p className="text-sm text-muted-foreground">Santé</p>
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{formatCurrency(project.budget || project.apiData?.budget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="phases">
            Phases ({phases.length})
          </TabsTrigger>
          <TabsTrigger value="livrables">
            Livrables ({livrables.length})
          </TabsTrigger>
          <TabsTrigger value="contrats">
            Contrats ({contrats.length})
          </TabsTrigger>
          <TabsTrigger value="prestataires">
            Prestataires ({prestataires.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        {/* ONGLET GÉNÉRAL */}
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
                  <Input value={project.code || `PRJ-${project.id}`} readOnly />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Input value={formatDate(project.dateDebut || project.date_debut)} readOnly />
                </div>
                <div>
                  <Label>Date de fin prévue</Label>
                  <Input value={formatDate(project.dateFin || project.date_fin_prevue)} readOnly />
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

        {/* ONGLET PHASES */}
        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Phases du projet</CardTitle>
              <Button onClick={() => setShowPhaseDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une phase
              </Button>
            </CardHeader>
            <CardContent>
              {phases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune phase définie pour ce projet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowPhaseDialog(true)}
                  >
                    Créer la première phase
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(phase.statut)}`} />
                          <h3 className="font-semibold">{phase.nom}</h3>
                          <Badge variant="outline">{phase.statut}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPhase(phase);
                              setShowPhaseDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {phase.description && (
                        <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Début:</span>
                          <p className="font-medium">{formatDate(phase.date_debut)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fin prévue:</span>
                          <p className="font-medium">{formatDate(phase.date_fin_prevue)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget alloué:</span>
                          <p className="font-medium">{formatCurrency(phase.budget_alloue)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Responsable:</span>
                          <p className="font-medium">{phase.responsable_nom || 'Non assigné'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Avancement</span>
                          <span>{phase.pourcentage_avancement}%</span>
                        </div>
                        <Progress value={phase.pourcentage_avancement} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUTRES ONGLETS - États vides pour l'instant */}
        <TabsContent value="livrables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Livrables du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun livrable défini pour ce projet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contrats du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun contrat défini pour ce projet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestataires" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prestataires du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun prestataire associé à ce projet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun document uploadé pour ce projet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal pour créer/modifier une phase */}
      <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPhase ? 'Modifier la phase' : 'Nouvelle phase'}
            </DialogTitle>
            <DialogDescription>
              Définissez les informations de la phase du projet.
            </DialogDescription>
          </DialogHeader>
          
          <PhaseForm 
            phase={editingPhase}
            onSave={(phaseData) => {
              // Ajouter la logique de sauvegarde ici
              console.log('Sauvegarde phase:', phaseData);
              setShowPhaseDialog(false);
              setEditingPhase(null);
              // Recharger les phases
              loadProjectData();
            }}
            onCancel={() => {
              setShowPhaseDialog(false);
              setEditingPhase(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant formulaire pour les phases
function PhaseForm({ phase, onSave, onCancel }: {
  phase: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    date_debut: '',
    date_fin_prevue: '',
    statut: 'Planifiée',
    budget_alloue: '',
    responsable_id: '',
    ...phase
  });

  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      alert('Le nom de la phase est obligatoire');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nom">Nom de la phase *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Ex: Cadrage, Développement..."
            required
          />
        </div>
        <div>
          <Label htmlFor="statut">Statut</Label>
          <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
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
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description de la phase..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date_debut">Date de début</Label>
          <Input
            id="date_debut"
            type="date"
            value={formData.date_debut}
            onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="date_fin_prevue">Date de fin prévue</Label>
          <Input
            id="date_fin_prevue"
            type="date"
            value={formData.date_fin_prevue}
            onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="budget_alloue">Budget alloué (€)</Label>
        <Input
          id="budget_alloue"
          type="number"
          value={formData.budget_alloue}
          onChange={(e) => setFormData({ ...formData, budget_alloue: e.target.value })}
          placeholder="0"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {phase ? 'Modifier' : 'Créer'}
        </Button>
      </DialogFooter>
    </div>
  );
}