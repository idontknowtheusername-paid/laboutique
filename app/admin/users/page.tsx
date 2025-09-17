'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AuthService, UserProfile } from '@/lib/services/auth.service';
import { Download, Search, Shield, Trash2, RefreshCw } from 'lucide-react';

export default function AdminUsersPage() {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const load = React.useCallback(async () => {
    setLoading(true);
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

    setLoading(false);
    if (!error && data) {
      setUsers(data as UserProfile[]);
      setTotalPages(count ? Math.max(1, Math.ceil(count / limit)) : 1);
    }
  }, [search, roleFilter, page]);

  React.useEffect(() => { load(); }, [load]);

  async function handleChangeRole(userId: string, newRole: UserProfile['role']) {
    const res = await AuthService.updateProfile(userId, { } as any);
    // Use direct update for role as it might be immutable in UpdateProfileData type
    const { error } = await (AuthService as any).getSupabaseClient()
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (!error) await load();
  }

  async function handleDelete(userId: string) {
    // Hard delete profile row; auth.user remains unless using admin API. This is acceptable for MVP.
    const { error } = await (AuthService as any).getSupabaseClient()
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (!error) await load();
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rafraîchir
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" /> Exporter
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10"
                placeholder="Rechercher (email, prénom, nom)"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v: 'all' | 'customer' | 'vendor' | 'admin') => { setRoleFilter(v); setPage(1); }}>
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
              <Button variant="outline" onClick={() => { setSearch(''); setRoleFilter('all'); setPage(1); }}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u: UserProfile) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-beshop-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{(u.first_name || u.email || '?')[0]}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-gray-500">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge className={u.role === 'admin' ? 'bg-purple-600' : u.role === 'vendor' ? 'bg-blue-600' : 'bg-gray-600'}>{u.role}</Badge>
                          <Select value={u.role} onValueChange={(v: UserProfile['role']) => handleChangeRole(u.id, v)}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Changer rôle" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Client</SelectItem>
                              <SelectItem value="vendor">Vendeur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} className="text-red-600">
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
              <Button size="sm" variant="outline" disabled={page===1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
              <span className="px-2 py-1 text-sm">Page {page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page===totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

