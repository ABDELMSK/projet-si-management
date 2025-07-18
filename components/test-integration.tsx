"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { userService } from "@/lib/api"

export default function TestIntegration() {
  const [email, setEmail] = useState('admin@entreprise.fr')
  const [password, setPassword] = useState('admin123')
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, logout, isLoading } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        setTestResult('✅ Connexion réussie !')
      } else {
        setTestResult('❌ Erreur: ' + result.error)
      }
    } catch (error) {
      setTestResult('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setLoading(false)
    }
  }

  const testUsersAPI = async () => {
    try {
      setTestResult('🔄 Test de l\'API utilisateurs...')
      const response = await userService.getAllUsers()
      if (response.success) {
        setTestResult(`✅ API utilisateurs: ${response.count} utilisateurs trouvés`)
      } else {
        setTestResult('❌ Erreur API utilisateurs: ' + response.message)
      }
    } catch (error) {
      setTestResult('❌ Erreur API: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    }
  }

  const handleLogout = () => {
    logout()
    setTestResult('✅ Déconnexion réussie')
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test d'Intégration Frontend ↔ Backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut utilisateur */}
          <div>
            <h3 className="font-semibold mb-2">Statut de connexion:</h3>
            {isLoading ? (
              <Badge variant="secondary">Vérification...</Badge>
            ) : user ? (
              <div className="space-y-2">
                <Badge variant="default">Connecté</Badge>
                <div className="text-sm">
                  <p><strong>Nom:</strong> {user.nom}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rôle:</strong> {user.role_nom}</p>
                  <p><strong>Direction:</strong> {user.direction_nom}</p>
                </div>
              </div>
            ) : (
              <Badge variant="outline">Non connecté</Badge>
            )}
          </div>

          {/* Formulaire de connexion */}
          {!user && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test de connexion:</h3>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button 
                onClick={handleLogin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
          )}

          {/* Actions pour utilisateur connecté */}
          {user && (
            <div className="space-y-2">
              <h3 className="font-semibold">Tests API:</h3>
              <div className="flex gap-2">
                <Button onClick={testUsersAPI} variant="outline">
                  Tester API Utilisateurs
                </Button>
                <Button onClick={handleLogout} variant="destructive">
                  Se déconnecter
                </Button>
              </div>
            </div>
          )}

          {/* Résultat des tests */}
          {testResult && (
            <div className="p-3 bg-gray-100 rounded-md">
              <h3 className="font-semibold mb-2">Résultat:</h3>
              <p className="text-sm">{testResult}</p>
            </div>
          )}

          {/* Informations de configuration */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
            <p><strong>Comptes de test:</strong></p>
            <ul className="ml-4">
              <li>• admin@entreprise.fr / admin123 (Admin)</li>
              <li>• marie.dubois@entreprise.fr / admin123 (Chef de Projet)</li>
              <li>• thomas.durand@entreprise.fr / admin123 (PMO)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}