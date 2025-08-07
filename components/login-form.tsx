// components/login-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Erreur de connexion")
    }
  }

  // Fonction pour remplir automatiquement les champs avec un compte de démonstration
  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col md:flex-row items-center gap-8">
    <img
      src="/login-image.png"
      alt="Connexion Illustration"
      className="w-64 h-auto hidden md:block"
    />
        </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre tableau de bord de gestion de projets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@entreprise.fr"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-3">Comptes de démonstration :</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="text-xs">
                  <div className="font-medium">Chef de Projet</div>
                  <div className="text-gray-600">marie.dubois@entreprise.fr</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoAccount("marie.dubois@entreprise.fr", "password123")}
                  disabled={isLoading}
                >
                  Utiliser
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="text-xs">
                  <div className="font-medium">PMO</div>
                  <div className="text-gray-600">thomas.durand@entreprise.fr</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoAccount("thomas.durand@entreprise.fr", "password123")}
                  disabled={isLoading}
                >
                  Utiliser
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="text-xs">
                  <div className="font-medium">Administrateur</div>
                  <div className="text-gray-600">admin@entreprise.fr</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoAccount("admin@entreprise.fr", "admin123")}
                  disabled={isLoading}
                >
                  Utiliser
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Développé pour la gestion de projets d'entreprise
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
