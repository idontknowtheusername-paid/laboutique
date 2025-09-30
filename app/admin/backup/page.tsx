'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  HardDrive, 
  Database, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Cloud,
  Server
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  size: number;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  created_at: string;
  duration?: number;
  location: 'local' | 'cloud' | 'external';
}

export default function AdminBackupPage() {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupSettings, setBackupSettings] = useState({
    frequency: 'daily',
    retention: '30',
    compression: 'enabled',
    encryption: 'enabled',
    location: 'cloud'
  });
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      // Simuler des backups
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: 'backup_2024_01_15_full',
          type: 'full',
          size: 2048576000, // 2GB
          status: 'completed',
          created_at: '2024-01-15T02:00:00Z',
          duration: 1800, // 30 minutes
          location: 'cloud'
        },
        {
          id: '2',
          name: 'backup_2024_01_14_incremental',
          type: 'incremental',
          size: 512000000, // 512MB
          status: 'completed',
          created_at: '2024-01-14T02:00:00Z',
          duration: 300, // 5 minutes
          location: 'cloud'
        },
        {
          id: '3',
          name: 'backup_2024_01_13_database',
          type: 'database',
          size: 1024000000, // 1GB
          status: 'completed',
          created_at: '2024-01-13T02:00:00Z',
          duration: 600, // 10 minutes
          location: 'local'
        },
        {
          id: '4',
          name: 'backup_2024_01_12_full',
          type: 'full',
          size: 1950000000, // 1.95GB
          status: 'failed',
          created_at: '2024-01-12T02:00:00Z',
          location: 'cloud'
        }
      ];
      setBackups(mockBackups);
    } catch (error) {
      console.error('Erreur lors du chargement des backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <HardDrive className="w-4 h-4" />;
      case 'incremental': return <Database className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'files': return <Server className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'local': return <HardDrive className="w-4 h-4" />;
      case 'external': return <Server className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const handleStartBackup = async () => {
    setIsBackupRunning(true);
    try {
      // Simuler le démarrage d'un backup
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: `backup_${new Date().toISOString().split('T')[0]}_manual`,
        type: 'full',
        size: 0,
        status: 'running',
        created_at: new Date().toISOString(),
        location: backupSettings.location as any
      };

      setBackups(prev => [newBackup, ...prev]);

      // Simuler la fin du backup après 30 secondes
      setTimeout(() => {
        setBackups(prev => prev.map(backup => 
          backup.id === newBackup.id 
            ? { ...backup, status: 'completed', size: 2048576000, duration: 1800 }
            : backup
        ));
        setIsBackupRunning(false);
      }, 30000);
    } catch (error) {
      console.error('Erreur lors du backup:', error);
      setIsBackupRunning(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      // Logique de restauration
      console.log('Restauration du backup:', backupId);
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sauvegarde et restauration"
        subtitle="Gestion des backups automatiques et manuels"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Restaurer
            </Button>
            <Button 
              className="bg-jomiastore-primary hover:bg-blue-700"
              onClick={handleStartBackup}
              disabled={isBackupRunning}
            >
              {isBackupRunning ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Backup en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Nouveau backup
                </>
              )}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="backups" className="space-y-6">
        <TabsList>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Historique des backups</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taille
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">{backup.name}</div>
                            {backup.duration && (
                              <div className="text-sm text-gray-500">
                                Durée: {formatDuration(backup.duration)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(backup.type)}
                            <span className="capitalize">{backup.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{formatFileSize(backup.size)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(backup.status)}
                            <Badge className={getStatusColor(backup.status)}>
                              {backup.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getLocationIcon(backup.location)}
                            <span className="capitalize">{backup.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(backup.created_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRestoreBackup(backup.id)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration automatique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fréquence</label>
                  <Select 
                    value={backupSettings.frequency} 
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rétention (jours)</label>
                  <Input
                    type="number"
                    value={backupSettings.retention}
                    onChange={(e) => setBackupSettings({ ...backupSettings, retention: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Compression</label>
                  <Select 
                    value={backupSettings.compression} 
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, compression: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Activée</SelectItem>
                      <SelectItem value="disabled">Désactivée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Chiffrement</label>
                  <Select 
                    value={backupSettings.encryption} 
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, encryption: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Activé</SelectItem>
                      <SelectItem value="disabled">Désactivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Localisation</label>
                  <Select 
                    value={backupSettings.location} 
                    onValueChange={(value) => setBackupSettings({ ...backupSettings, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="external">Externe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Sauvegarder la configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Chiffrement activé</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Tous les backups sont chiffrés avec AES-256
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Stockage cloud</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Sauvegarde automatique sur AWS S3
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Test de restauration</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Dernier test: il y a 7 jours
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Tester la restauration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Espace utilisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.2 GB</div>
                <p className="text-sm text-gray-500">sur 10 GB disponibles</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-jomiastore-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Dernier backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2h</div>
                <p className="text-sm text-gray-500">il y a 2 heures</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Taux de réussite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98.5%</div>
                <p className="text-sm text-gray-500">sur les 30 derniers jours</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Statut des services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Service de backup</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Stockage cloud</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Stockage local</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Espace faible</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}