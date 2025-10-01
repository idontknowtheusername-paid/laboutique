'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticlesService, ArticlePost } from '@/lib/services/articles.service';
import { Badge } from '@/components/ui/badge';
import WysiwygEditor from '@/components/admin/WysiwygEditor';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminEditArticlePage() {
  const params = useParams();
  const id = Array.isArray((params as any)?.id) ? (params as any)?.id[0] : (params as any)?.id;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [post, setPost] = React.useState<ArticlePost | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await ArticlesService.getById(id);
      setLoading(false);
      if (res.success) setPost(res.data as ArticlePost);
    })();
  }, [id]);

  async function save(patch: Partial<ArticlePost>) {
    if (!post) return;
    setSaving(true);
    setMessage('');
    const res = await ArticlesService.update({ id: post.id, ...patch } as any);
    setSaving(false);
    if (res.success && res.data) { setPost(res.data as ArticlePost); setMessage('Article sauvegardé.'); } else { setMessage(res.error || 'Erreur'); }
  }

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!post) return <div className="p-6">Article introuvable.</div>;

  return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Éditer article"
          subtitle="Mettre à jour le contenu"
          actions={message ? <Badge className="bg-blue-600">{message}</Badge> : null}
        />

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader><CardTitle>Contenu</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Titre</label>
                  <Input value={post.title} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPost({ ...post, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Slug</label>
                  <Input value={post.slug} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPost({ ...post, slug: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Résumé</label>
                  <Textarea value={post.excerpt || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setPost({ ...post, excerpt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Contenu</label>
                  <WysiwygEditor
                    value={post.content || ''}
                    onChange={(content) => setPost({ ...post, content })}
                    placeholder="Rédigez votre article ici..."
                    height={500}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Utilisez l'éditeur pour formater votre contenu avec du texte enrichi, des images, des liens, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Meta Title</label>
                  <Input value={post.seo_title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPost({ ...post, seo_title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Meta Description</label>
                  <Input value={post.seo_description || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPost({ ...post, seo_description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>save({})} disabled={saving}>Enregistrer</Button>
          <Button className="bg-jomionstore-primary hover:bg-blue-700" onClick={()=>save({ status: 'published' } as any)} disabled={saving}>Publier</Button>
        </div>
      </div>
  );
}

