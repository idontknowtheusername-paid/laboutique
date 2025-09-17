"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthDebugInfo } from "@/components/auth/AuthDebugInfo";
import { useSessionManager } from "@/hooks/useSessionManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

function ProfileEditPageContent() {
  const { profile, updateProfile, loading, user } = useAuth();
  const { addToast } = useToast();

  // Initialize session manager for this protected page
  useSessionManager({
    autoRefresh: true,
    redirectOnExpiry: true,
  });
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateProfile = (first_name: string, last_name: string, email: string) => {
    if (!first_name.trim()) return "Le prénom est obligatoire.";
    if (!last_name.trim()) return "Le nom est obligatoire.";
    if (!email.trim()) return "L'email est obligatoire.";
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "L'adresse email n'est pas valide.";
    if (first_name.length < 2) return "Le prénom doit contenir au moins 2 caractères.";
    if (last_name.length < 2) return "Le nom doit contenir au moins 2 caractères.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { first_name, last_name, email } = form;
    const validationError = validateProfile(first_name, last_name, email);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }
    try {
      const result = await updateProfile({ first_name, last_name, email });
      if (result.success) {
        addToast({
          type: "success",
          title: "Profil mis à jour",
          description: "Vos informations ont bien été enregistrées."
        });
      } else {
        setError(result.error || "Erreur lors de la mise à jour du profil");
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  // Password change handler
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    setPwSaving(true);
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Tous les champs sont obligatoires.");
      setPwSaving(false);
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      setPwSaving(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Les mots de passe ne correspondent pas.");
      setPwSaving(false);
      return;
    }
    try {
      // Appel direct à AuthService.changePassword (ou via useAuth si exposé)
      const { AuthService } = await import("@/lib/services");
      const result = await AuthService.changePassword({ currentPassword, newPassword });
      if (result.success) {
        setPwSuccess("Mot de passe modifié avec succès.");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        addToast({
          type: "success",
          title: "Mot de passe modifié",
          description: "Votre mot de passe a bien été changé."
        });
      } else {
        setPwError(result.error || "Erreur lors du changement de mot de passe");
      }
    } catch (e: any) {
      setPwError(e.message || "Erreur lors du changement de mot de passe");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-md mx-auto px-4">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/account">Retour à mon compte</Link>
        </Button>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifier mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <Input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="given-name"
                  aria-invalid={!!error && error.toLowerCase().includes('prénom')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="family-name"
                  aria-invalid={!!error && error.toLowerCase().includes('nom')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  aria-invalid={!!error && error.toLowerCase().includes('email')}
                />
              </div>
              {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password change form */}
        <Card>
          <CardHeader>
            <CardTitle>Changer mon mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePwSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
                <Input name="currentPassword" type="password" value={pwForm.currentPassword} onChange={handlePwChange} required autoComplete="current-password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                <Input name="newPassword" type="password" value={pwForm.newPassword} onChange={handlePwChange} required autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
                <Input name="confirmPassword" type="password" value={pwForm.confirmPassword} onChange={handlePwChange} required autoComplete="new-password" />
              </div>
              {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
              {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
              <Button type="submit" className="w-full" disabled={pwSaving}>
                {pwSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfileEditPageContent />
      <AuthDebugInfo />
    </ProtectedRoute>
  );
}
