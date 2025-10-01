'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AuthService, UserProfile } from '@/lib/services/auth.service';
import { Download, Search, Shield, Trash2, RefreshCw } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { useToast } from '@/components/admin/Toast';

export default function AdminUsersPage() {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const { success, error, info } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const client = (AuthService as any).getSupabaseClient();
      let query = client.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false });

      if (search) {
        // basic ilike on email, first_name, last_name
        query = query.or(
          `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
        );
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const limit = 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        error('Erreur de chargement', `Impossible de charger les utilisateurs: ${error.message}`);
        setUsers([]);
        setTotalPages(1);
      } else if (data) {
        setUsers(data as UserProfile[]);
        setTotalPages(count ? Math.max(1, Math.ceil(count / limit)) : 1);
        success('Données chargées', `${data.length} utilisateurs chargés`);
      } else {
        setUsers([]);
        setTotalPages(1);
        info('Aucun utilisateur', 'Aucun utilisateur trouvé dans la base de données');
      }
    } catch (err) {
      console.error('Erreur inattendue lors du chargement des utilisateurs:', err);
      error('Erreur inattendue', 'Une erreur est survenue lors du chargement des utilisateurs');
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, success, error, info]);

  React.useEffect(() => { load(); }, [load]);

  async function handleChangeRole(userId: string, newRole: UserProfile['role']) {
    const res = await AuthService.updateProfile(userId, {} as any);
    const { error } = await (AuthService as any).getSupabaseClient()
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (!error) {
      await load();
      success("Rôle modifié", "Le rôle de l'utilisateur a été mis à jour.");
    } else {
      error("Erreur", "Impossible de modifier le rôle.");
    }
  }

  async function handleDelete(userId: string) {
    const { error } = await (AuthService as any)
      .getSupabaseClient()
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (!error) {
      await load();
      success("Utilisateur supprimé", "L'utilisateur a bien été supprimé.");
    } else {
      error("Erreur", "Impossible de supprimer l'utilisateur.");
    }
  }

  // Test de connexion à la base de données
  async function testDatabaseConnection() {
    try {
      const client = (AuthService as any).getSupabaseClient();
      const { data, error } = await client.from('profiles').select('count').limit(1);
      
      if (error) {
        error('Erreur de connexion', `Impossible de se connecter à la base: ${error.message}`);
      } else {
        success('Connexion réussie', 'La base de données est accessible');
      }
    } catch (err) {
      error('Erreur de connexion', 'Impossible de se connecter à la base de données');
    }
  }

  // Export CSV
  function handleExportCSV() {
    if (!users.length) {
      info("Aucun utilisateur à exporter");
      return;
    }
    const headers = [
      "id",
      "email",
      "first_name",
      "last_name",
      "role",
      "created_at",
    ];
    const csvRows = [headers.join(",")];
    users.forEach((u) => {
      csvRows.push(
        [
          u.id,
          u.email,
          u.first_name || "",
          u.last_name || "",
          u.role,
          u.created_at,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
    success("Export CSV", "Le fichier CSV a été téléchargé.");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Utilisateurs"
        subtitle="Gestion des comptes et rôles"
        actions={
          <>
            <Button variant="outline" onClick={testDatabaseConnection}>
              🔍 Test DB
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Exporter
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <AdminToolbar>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Rechercher (email, prénom, nom)"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v: "all" | "customer" | "vendor" | "admin") => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="customer">Client</SelectItem>
                <SelectItem value="vendor">Vendeur</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setPage(1);
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </AdminToolbar>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u: UserProfile) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-jomionstore-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(u.first_name || u.email || "?")[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            u.role === "admin"
                              ? "bg-purple-600"
                              : u.role === "vendor"
                              ? "bg-blue-600"
                              : "bg-gray-600"
                          }
                        >
                          {u.role}
                        </Badge>
                        <Select
                          value={u.role}
                          onValueChange={(v: UserProfile["role"]) =>
                            handleChangeRole(u.id, v)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Changer rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Client</SelectItem>
                            <SelectItem value="vendor">Vendeur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-2 py-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <span className="px-2 py-1 text-sm">
              Page {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

