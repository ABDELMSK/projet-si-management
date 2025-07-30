import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, Search, Edit, Trash2, Eye, Calendar as CalIcon, 
  FolderOpen, Users, Target, Loader2, AlertCircle, RefreshCw,
  Save, X, Euro, Clock, CheckCircle
} from 'lucide-react';

// Types simplifiés pour la démo
interface Project {
  id: number;
  nom: string;
  description?: string;
  chef_projet_id: number;
  chef_projet_nom: string;
  direction_id: number;
  direction_nom: string;
  statut_id: number;
  statut_nom: string;
  statut_couleur: string;
  budget?: number;
  date_debut?: string;
  date_fin_prevue?: string;
  pourcentage_avancement: number;
  priorite: string;
  created_at: string;
}

interface ReferenceData {
  directions: Array<{id: number, nom: string}>;
  statuts: Array<{id: number, nom: string, couleur: string}>;
  utilisateurs: Array<{id: number, nom: string, email: string}>;
}

// Données de démonstration
const mockProjects: Project[] = [
  {
    id: 1,
    nom: "Migration ERP SAP",
    description: "Migration complète vers SAP S/4HANA",
    chef_projet_id: 1,
    chef_projet_nom: "Marie Dubois",
    direction_id: 1,
    direction_nom: "DSI",
    statut_id: 2,
    statut_nom: "En cours",
    statut_couleur: "#3B82F6",
    budget: 450000,
    date_debut: "2024-01-15",
    date_fin_prevue: "2024-12-31",
    pourcentage_avancement: 65,
    priorite: "Haute",
    created_at: "2024-01-01"
  },
  {
    id: 2,
    nom: "Sécurisation Infrastructure",
    description: "Mise en place d'un nouveau système de sécurité",
    chef_projet_id: 2,
    chef_projet_nom: "Pierre Martin",
    direction_id: 1,
    direction_nom: "DSI",
    statut_id: 2,
    statut_nom: "En cours",
    statut_couleur: "#3B82F6",
    budget: 280000,
    date_debut: "2024-03-01",
    date_fin_prevue: "2024-08-31",
    pourcentage_avancement: 30,
    priorite: "Normale",
    created_at: "2024-02-15"
  }
];

const mockReferenceData: ReferenceData = {
  directions: [
    { id: 1, nom: "DSI" },
    { id: 2, nom: "Finance" },
    { id: 3, nom: "RH" },
    { id: 4, nom: "Marketing" }
  ],
  statuts: [
    { id: 1, nom: "Planification", couleur: "#6B7280" },
    { id: 2, nom: "En cours", couleur: "#3B82F6" },
    { id: 3, nom: "En pause", couleur: "#F59E0B" },
    { id: 4, nom: "Terminé", couleur: "#10B981" },
    { id: 5, nom: "Annulé", couleur: "#EF4444" }
  ],
  utilisateurs: [
    { id: 1, nom: "Marie Dubois", email: "marie.dubois@entreprise.fr" },
    { id: 2, nom: "Pierre Martin", email: "pierre.martin@entreprise.fr" },
    { id: 3, nom: "Sophie Laurent", email: "sophie.laurent@entreprise.fr" },
    { id: 4, nom: "Thomas Durand", email: "thomas.durand@entreprise.fr" }
  ]
};

export default function ProjectsCRUD() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [referenceData] = useState<ReferenceData>(mockReferenceData);
  
  // Formulaire state
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    chef_projet_id: 0,
    direction_id: 0,
    statut_id: 0,
    budget: 0,
    date_debut: "",
    date_fin_prevue: "",
    priorite: "Normale"
  });

  const [dateDebut, setDateDebut] = useState<Date>();
  const [dateFin, setDateFin] = useState<Date>();

  // Formatage de date simple
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR');
  };

  const formatToISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nom: "",
      description: "",
      chef_projet_id: 0,
      direction_id: 0,
      statut_id: 0,
      budget: 0,
      date_debut: "",
      date_fin_prevue: "",
      priorite: "Normale"
    });
    setDateDebut(undefined);
    setDateFin(undefined);
  };

  // Ouvrir dialog de création
  const handleCreate = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  // Ouvrir dialog d'édition
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      nom: project.nom,
      description: project.description || "",
      chef_projet_id: project.chef_projet_id,
      direction_id: project.direction_id,
      statut_id: project.statut_id,
      budget: project.budget || 0,
      date_debut: project.date_debut || "",
      date_fin_prevue: project.date_fin_prevue || "",
      priorite: project.priorite
    });
    setDateDebut(project.date_debut ? new Date(project.date_debut) : undefined);
    setDateFin(project.date_fin_prevue ? new Date(project.date_fin_prevue) : undefined);
    setShowEditDialog(true);
  };

  // Ouvrir dialog de suppression
  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  // Soumettre création
  const handleSubmitCreate = async () => {
    setIsLoading(true);
    
    try {
      // Simuler appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject: Project = {
        id: Math.max(...projects.map(p => p.id)) + 1,
        ...formData,
        chef_projet_nom: referenceData.utilisateurs.find(u => u.id === formData.chef_projet_id)?.nom || "",
        direction_nom: referenceData.directions.find(d => d.id === formData.direction_id)?.nom || "",
        statut_nom: referenceData.statuts.find(s => s.id === formData.statut_id)?.nom || "",
        statut_couleur: referenceData.statuts.find(s => s.id === formData.statut_id)?.couleur || "",
        pourcentage_avancement: 0,
        created_at: new Date().toISOString()
      };
      
      setProjects([...projects, newProject]);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error("Erreur création:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Soumettre modification
  const handleSubmitEdit = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProject: Project = {
        ...selectedProject,
        ...formData,
        chef_projet_nom: referenceData.utilisateurs.find(u => u.id === formData.chef_projet_id)?.nom || "",
        direction_nom: referenceData.directions.find(d => d.id === formData.direction_id)?.nom || "",
        statut_nom: referenceData.statuts.find(s => s.id === formData.statut_id)?.nom || "",
        statut_couleur: referenceData.statuts.find(s => s.id === formData.statut_id)?.couleur || ""
      };
      
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
      setShowEditDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur modification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer suppression
  const handleConfirmDelete = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setShowDeleteDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer projets
  const filteredProjects = projects.filter(project =>
    project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.chef_projet_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.direction_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatage
  const formatCurrency = (amount?: number) => {
    if (!amount) return "Non défini";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateString = (dateString?: string) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "destructive";
      case "Normale": return "secondary";
      case "Faible": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total projets</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.statut_nom === "En cours").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(projects.reduce((sum, p) => sum + (p.budget || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avancement moyen</p>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((sum, p) => sum + p.pourcentage_avancement, 0) / projects.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Gestion des Projets
              </CardTitle>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Projet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des projets */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Projet</th>
                  <th className="text-left p-4 font-medium">Chef de projet</th>
                  <th className="text-left p-4 font-medium">Direction</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Priorité</th>
                  <th className="text-left p-4 font-medium">Avancement</th>
                  <th className="text-left p-4 font-medium">Budget</th>
                  <th className="text-left p-4 font-medium">Échéance</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{project.nom}</div>
                        <div className="text-sm text-gray-500">{project.description}</div>
                      </div>
                    </td>
                    <td className="p-4">{project.chef_projet_nom}</td>
                    <td className="p-4">{project.direction_nom}</td>
                    <td className="p-4">
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: project.statut_couleur, color: project.statut_couleur }}
                      >
                        {project.statut_nom}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={getPriorityColor(project.priorite)}>
                        {project.priorite}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Progress value={project.pourcentage_avancement} className="w-20" />
                        <span className="text-xs text-gray-500">{project.pourcentage_avancement}%</span>
                      </div>
                    </td>
                    <td className="p-4">{formatCurrency(project.budget)}</td>
                    <td className="p-4">{formatDateString(project.date_fin_prevue)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun projet trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
            <DialogDescription>
              Remplissez les informations du projet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du projet *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Migration ERP SAP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget || ""}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  placeholder="450000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du projet..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chef">Chef de projet *</Label>
                <Select 
                  value={formData.chef_projet_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, chef_projet_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData.utilisateurs.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select 
                  value={formData.direction_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, direction_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData.directions.map((direction) => (
                      <SelectItem key={direction.id} value={direction.id.toString()}>
                        {direction.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select 
                  value={formData.statut_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, statut_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData.statuts.map((statut) => (
                      <SelectItem key={statut.id} value={statut.id.toString()}>
                        {statut.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priorite">Priorité</Label>
                <Select 
                  value={formData.priorite} 
                  onValueChange={(value) => setFormData({ ...formData, priorite: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faible">Faible</SelectItem>
                    <SelectItem value="Normale">Normale</SelectItem>
                    <SelectItem value="Haute">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalIcon className="mr-2 h-4 w-4" />
                      {dateDebut ? formatDate(dateDebut) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateDebut}
                      onSelect={(date) => {
                        setDateDebut(date);
                        setFormData({ ...formData, date_debut: date ? formatToISO(date) : "" });
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date de fin prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalIcon className="mr-2 h-4 w-4" />
                    {dateFin ? formatDate(dateFin) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={(date) => {
                      setDateFin(date);
                      setFormData({ ...formData, date_fin_prevue: date ? formatToISO(date) : "" });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le projet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez les informations du projet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom-edit">Nom du projet *</Label>
                <Input
                  id="nom-edit"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget-edit">Budget (€)</Label>
                <Input
                  id="budget-edit"
                  type="number"
                  value={formData.budget || ""}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-edit">Description</Label>
              <Textarea
                id="description-edit"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chef de projet</Label>
                <Select 
                  value={formData.chef_projet_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, chef_projet_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData.utilisateurs.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={formData.statut_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, statut_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceData.statuts.map((statut) => (
                      <SelectItem key={statut.id} value={statut.id.toString()}>
                        {statut.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet "{selectedProject?.nom}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}