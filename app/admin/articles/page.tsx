'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArticlesService, ArticlePost } from '@/lib/services/articles.service';
import Link from 'next/link';

export default function AdminArticlesPage() {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [items, setItems] = React.useState<ArticlePost[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await ArticlesService.getAll(status === 'all' ? {} : { status });
    setLoading(false);
    if (res.success && res.data) {
      let list = res.data.items as any as ArticlePost[];
      if (search) list = list.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
      setItems(list);
    }
  }, [search, status]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <ProtectedRoute requireAuth={true} requireRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Articles</h1>
          <Button asChild className="bg-beshop-primary hover:bg-blue-700"><Link href="/admin/articles/new">Nouvel article</Link></Button>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-72">
              <Input className="pl-3" placeholder="Rechercher un article" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} />
            </div>
            <Select value={status} onValueChange={(v: any)=>setStatus(v)}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={()=>{ setSearch(''); setStatus('all'); }}>Réinitialiser</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Liste</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publié</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{a.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{a.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{a.published_at ? new Date(a.published_at).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm"><Link href={`/admin/articles/${a.id}/edit`}>Éditer</Link></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

