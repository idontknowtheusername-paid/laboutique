'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticlesService, CreateArticleData } from '@/lib/services/articles.service';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/admin/ImageUploader';

export default function AdminNewArticlePage() {
  const { profile } = useAuth();
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [form, setForm] = React.useState<Partial<CreateArticleData>>({ title: '', slug: '', excerpt: '', content: '', status: 'draft', seo_title: '', seo_description: '' });

  const set = (p: Partial<CreateArticleData>) => setForm((s) => ({ ...s, ...p }));

  async function save(status: 'draft' | 'published') {
    setSaving(true);
    setMessage('');
    const payload: CreateArticleData = {
      title: form.title || '',
      slug: (form.slug || '').trim(),
      excerpt: form.excerpt || '',
      content: form.content || '',
      cover_image_url: form.cover_image_url,
      status,
      author_id: profile?.id || '',
      seo_title: form.seo_title,
      seo_description: form.seo_description,
    };
    const res = await ArticlesService.create(payload);
    setSaving(false);
    if (res.success && res.data) setMessage('Article créé.'); else setMessage(res.error || 'Erreur');
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nouvel article</h1>
          {message && <Badge className="bg-blue-600">{message}</Badge>}
        </div>

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
                  <Input value={form.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>set({ title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Slug</label>
                  <Input value={form.slug || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>set({ slug: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Résumé</label>
                  <Textarea value={form.excerpt || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>set({ excerpt: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2">Contenu</label>
                  <Textarea value={form.content || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>set({ content: e.target.value })} rows={12} />
                </div>
                <div className="md:col-span-2">
                  <ImageUploader
                    label="Image de couverture"
                    bucket="public"
                    folder="articles"
                    multiple={false}
                    value={form.cover_image_url ? { url: form.cover_image_url } : null}
                    onChange={(next)=>{
                      const url = Array.isArray(next) ? next[0]?.url : next?.url;
                      set({ cover_image_url: url });
                    }}
                  />
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
                  <Input value={form.seo_title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>set({ seo_title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-2">Meta Description</label>
                  <Input value={form.seo_description || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>set({ seo_description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>save('draft')} disabled={saving}>Enregistrer brouillon</Button>
          <Button className="bg-beshop-primary hover:bg-blue-700" onClick={()=>save('published')} disabled={saving}>Publier</Button>
        </div>
      </div>
  );
}

