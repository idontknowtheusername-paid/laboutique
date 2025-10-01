"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings, User, Bell, Shield, Globe, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccountService, NotificationPrefs } from '@/lib/services/account.service';

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [notificationPrefs, setNotificationPrefs] = React.useState<NotificationPrefs | null>(null);
  const [profileData, setProfileData] = React.useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    language: 'fr',
    timezone: 'Africa/Porto-Novo'
  });

  React.useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const res = await AccountService.getNotificationPrefs(user.id);
      if (res.success && res.data) {
        setNotificationPrefs(res.data);
      }
    })();
  }, [user?.id]);

  const handleProfileUpdate = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = await updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        bio: profileData.bio
      });
      
      if (result.success) {
        // Show success message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    if (!user?.id || !notificationPrefs) return;
    try {
      await AccountService.upsertNotificationPrefs(user.id, notificationPrefs);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    // Implement account deletion
    console.log('Account deletion requested');
  };

  return (
    <ProtectedRoute>
      <div>
        <div className="py-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <a href="/" className="hover:text-jomionstore-primary">Accueil</a>
            <span>/</span>
            <a href="/account" className="hover:text-jomionstore-primary">Mon compte</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Paramètres</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Prénom</label>
                      <Input
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom</label>
                      <Input
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Téléphone</label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Parlez-nous de vous..."
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleProfileUpdate} disabled={loading} className="bg-jomionstore-primary hover:bg-blue-700">
                    {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Préférences de notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notificationPrefs ? (
                    <>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Emails de commandes</div>
                          <div className="text-sm text-gray-600">Confirmations, expéditions, retours</div>
                        </div>
                        <Switch
                          checked={notificationPrefs.email_orders}
                          onCheckedChange={(checked) => {
                            setNotificationPrefs({...notificationPrefs, email_orders: checked});
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Emails promotionnels</div>
                          <div className="text-sm text-gray-600">Offres, coupons, recommandations</div>
                        </div>
                        <Switch
                          checked={notificationPrefs.email_promos}
                          onCheckedChange={(checked) => {
                            setNotificationPrefs({...notificationPrefs, email_promos: checked});
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">SMS de commandes</div>
                          <div className="text-sm text-gray-600">Mises à jour expédition</div>
                        </div>
                        <Switch
                          checked={notificationPrefs.sms_orders}
                          onCheckedChange={(checked) => {
                            setNotificationPrefs({...notificationPrefs, sms_orders: checked});
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Notifications push</div>
                          <div className="text-sm text-gray-600">Mises à jour en temps réel</div>
                        </div>
                        <Switch
                          checked={notificationPrefs.push_all}
                          onCheckedChange={(checked) => {
                            setNotificationPrefs({...notificationPrefs, push_all: checked});
                          }}
                        />
                      </div>
                      
                      <Button onClick={handleNotificationUpdate} className="bg-jomionstore-primary hover:bg-blue-700">
                        Sauvegarder les préférences
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chargement des préférences...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Confidentialité et sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Partage de données</div>
                        <div className="text-sm text-gray-600">Autoriser le partage de données pour améliorer l'expérience</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Profil public</div>
                        <div className="text-sm text-gray-600">Rendre votre profil visible par d'autres utilisateurs</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Modifier le mot de passe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Language & Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Langue et région
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Langue</label>
                    <select 
                      value={profileData.language}
                      onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fuseau horaire</label>
                    <select 
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Africa/Porto-Novo">Porto-Novo (GMT+1)</option>
                      <option value="Africa/Cotonou">Cotonou (GMT+1)</option>
                      <option value="Europe/Paris">Paris (GMT+1)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="w-5 h-5" />
                    Zone dangereuse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">Supprimer le compte</div>
                      <div className="text-sm text-red-600 mt-1">
                        Cette action est irréversible. Toutes vos données seront supprimées.
                      </div>
                      <Button 
                        variant="destructive" 
                        className="mt-3"
                        onClick={handleDeleteAccount}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/account/security">
                      <Shield className="w-4 h-4 mr-2" />
                      Sécurité
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/account/notifications">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/account/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Besoin d'aide ?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>Si vous avez des questions sur vos paramètres, consultez notre centre d'aide.</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Centre d'aide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}