"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { Edit, Save, X } from "lucide-react"

export default function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
  })

  if (!user) return null

  const handleSave = () => {
    // Ici on sauvegarderait les modifications
    console.log("Sauvegarde du profil:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      nom: user.nom,
      email: user.email,
    })
    setIsEditing(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Chef de Projet":
        return "default"
      case "PMO / Directeur de projets":
        return "secondary"
      case "Administrateur fonctionnel":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.nom} />
              <AvatarFallback className="text-lg">
                {user.nom
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user.nom}</h3>
              <Badge variant={getRoleColor(user.role)} className="mt-1">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet</Label>
              {isEditing ? (
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              ) : (
                <Input value={user.nom} readOnly />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <Input value={user.email} readOnly />
              )}
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Input value={user.role} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Input value={user.direction} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full bg-transparent">
            Changer le mot de passe
          </Button>
          <div className="text-sm text-muted-foreground">
            <p>Dernière connexion : {new Date().toLocaleDateString("fr-FR")}</p>
            <p>Session expire dans : 7h 45min</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
