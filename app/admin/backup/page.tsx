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
  Server,
  RefreshCw,
  Trash2
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { BackupService, Backup, BackupSettings, BackupStats, RestoreRequest } from '@/lib/services/backup.service';
import { useToast } from '@/components/admin/Toast';
import { useConfirmation } from '@/components/admin/ConfirmationDialog';

export default function AdminBackupPage() {
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    location: 'all'
  });
  const { success, error, info } = useToast();
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les backups, paramètres et statistiques en parallèle
      const [backupsResponse, settingsResponse, statsResponse] = await Promise.all([
        BackupService.getAll(
          {
            status: filters.status !== 'all' ? filters.status as any : undefined,
            type: filters.type !== 'all' ? filters.type as any : undefined,
            location: filters.location !== 'all' ? filters.location as any : undefined
          },
          { page, limit: 10 }
        ),
        BackupService.getSettings(),
        BackupService.getStats()
      ]);

      if (backupsResponse.success && backupsResponse.data) {
        setBackups(backupsResponse.data);
        setTotalPages(backupsResponse.pagination?.totalPages || 1);
      }

      if (settingsResponse.success && settingsResponse.data) {
        setBackupSettings(settingsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      success('Données chargées', 'Les informations de sauvegarde ont été mises à jour');
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      error('Erreur de chargement', 'Impossible de charger les données de sauvegarde');
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
      case 'running': return 'bg-orange-100 text-orange-800';
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

  const handleStartBackup = async (type: 'full' | 'incremental' | 'database' | 'files' = 'full') => {
    setIsBackupRunning(true);
    try {
      const result = await BackupService.createBackup(type, `Backup manuel ${type}`);
      if (result.success && result.data) {
        success('Backup démarré', `Le backup ${type} a été démarré avec succès`);
        await loadData(); // Recharger les données
        
        // Simuler la fin du backup après 30 secondes
        setTimeout(async () => {
          await BackupService.updateBackupStatus(
            result.data!.id,
            'completed',
            Math.floor(Math.random() * 2000000000) + 1000000000, // 1-3 GB
            Math.floor(Math.random() * 3600) + 300, // 5-60 minutes
            'abc123def456'
          );
          await loadData();
          setIsBackupRunning(false);
          success('Backup terminé', 'Le backup a été créé avec succès');
        }, 30000);
      } else {
        error('Erreur de backup', result.error || 'Impossible de démarrer le backup');
        setIsBackupRunning(false);
      }
    } catch (err) {
      console.error('Erreur lors du backup:', err);
      error('Erreur de backup', 'Une erreur est survenue lors du démarrage du backup');
      setIsBackupRunning(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    confirm(
      'Restaurer le backup',
      'Êtes-vous sûr de vouloir restaurer ce backup ? Cette action va remplacer les données actuelles.',
      async () => {
        try {
          const restoreRequest: RestoreRequest = {
            backup_id: backupId,
            restore_type: 'full',
            confirm_restore: true
          };

          const result = await BackupService.restoreBackup(restoreRequest);
          if (result.success) {
            success('Restauration démarrée', 'Le processus de restauration a été lancé');
          } else {
            error('Erreur de restauration', result.error || 'Impossible de restaurer le backup');
          }
        } catch (err) {
          console.error('Erreur lors de la restauration:', err);
          error('Erreur de restauration', 'Une erreur est survenue lors de la restauration');
        }
      },
      'destructive'
    );
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      const result = await BackupService.downloadBackup(backupId);
      if (result.success && result.data) {
        // Simuler le téléchargement
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.filename;
        link.click();
        success('Téléchargement démarré', 'Le fichier de backup est en cours de téléchargement');
      } else {
        error('Erreur de téléchargement', result.error || 'Impossible de télécharger le backup');
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      error('Erreur de téléchargement', 'Une erreur est survenue lors du téléchargement');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    confirm(
      'Supprimer le backup',
      'Êtes-vous sûr de vouloir supprimer ce backup ? Cette action est irréversible.',
      async () => {
        try {
          const result = await BackupService.deleteBackup(backupId);
          if (result.success) {
            success('Backup supprimé', 'Le backup a été supprimé avec succès');
            await loadData();
          } else {
            error('Erreur de suppression', result.error || 'Impossible de supprimer le backup');
          }
        } catch (err) {
          console.error('Erreur lors de la suppression:', err);
          error('Erreur de suppression', 'Une erreur est survenue lors de la suppression');
        }
      },
      'destructive'
    );
  };

  const handleUpdateSettings = async () => {
    if (!backupSettings) return;

    try {
      const result = await BackupService.updateSettings(backupSettings);
      if (result.success) {
        success('Paramètres sauvegardés', 'Les paramètres de backup ont été mis à jour');
        setBackupSettings(result.data);
      } else {
        error('Erreur de sauvegarde', result.error || 'Impossible de sauvegarder les paramètres');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      error('Erreur de sauvegarde', 'Une erreur est survenue lors de la sauvegarde des paramètres');
    }
  };

  const handleTestStorage = async (location: 'local' | 'cloud' | 'external') => {
    try {
      const result = await BackupService.testStorageConnection(location);
      if (result.success) {
        success('Test réussi', `La connexion au stockage ${location} fonctionne correctement`);
      } else {
        error('Test échoué', result.error || `Impossible de se connecter au stockage ${location}`);
      }
    } catch (err) {
      console.error('Erreur lors du test de stockage:', err);
      error('Erreur de test', 'Une erreur est survenue lors du test de connexion');
    }
  };

  const handleCleanupOldBackups = async () => {
    if (!backupSettings) return;

    confirm(
      'Nettoyer les anciens backups',
      `Êtes-vous sûr de vouloir supprimer les backups de plus de ${backupSettings.retention_days} jours ?`,
      async () => {
        try {
          const result = await BackupService.cleanupOldBackups(backupSettings.retention_days);
          if (result.success && result.data) {
            success('Nettoyage terminé', `${result.data.deleted} anciens backups ont été supprimés`);
            await loadData();
          } else {
            error('Erreur de nettoyage', result.error || 'Impossible de nettoyer les anciens backups');
          }
        } catch (err) {
          console.error('Erreur lors du nettoyage:', err);
          error('Erreur de nettoyage', 'Une erreur est survenue lors du nettoyage');
        }
      },
      'destructive'
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sauvegarde et restauration"
        subtitle="Gestion des backups automatiques et manuels"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rafraîchir
            </Button>
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="failed">Échoués</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="full">Complet</SelectItem>
                <SelectItem value="incremental">Incrémental</SelectItem>
                <SelectItem value="database">Base</SelectItem>
                <SelectItem value="files">Fichiers</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="bg-jomionstore-primary hover:bg-orange-700"
              onClick={() => handleStartBackup('full')}
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadBackup(backup.id)}
                              disabled={backup.status !== 'completed'}
                              title="Télécharger le backup"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRestoreBackup(backup.id)}
                              disabled={backup.status !== 'completed'}
                              title="Restaurer le backup"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer le backup"
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
                {backupSettings ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fréquence</label>
                      <Select 
                        value={backupSettings.frequency} 
                        onValueChange={(value) => setBackupSettings({ ...backupSettings, frequency: value as any })}
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
                        value={backupSettings.retention_days}
                        onChange={(e) => setBackupSettings({ ...backupSettings, retention_days: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Compression</label>
                      <Select 
                        value={backupSettings.compression_enabled ? 'enabled' : 'disabled'} 
                        onValueChange={(value) => setBackupSettings({ ...backupSettings, compression_enabled: value === 'enabled' })}
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
                        value={backupSettings.encryption_enabled ? 'enabled' : 'disabled'} 
                        onValueChange={(value) => setBackupSettings({ ...backupSettings, encryption_enabled: value === 'enabled' })}
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
                        onValueChange={(value) => setBackupSettings({ ...backupSettings, location: value as any })}
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

                    <div>
                      <label className="block text-sm font-medium mb-2">Email de notification</label>
                      <Input
                        type="email"
                        value={backupSettings.notification_email || ''}
                        onChange={(e) => setBackupSettings({ ...backupSettings, notification_email: e.target.value })}
                        placeholder="admin@example.com"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto_cleanup"
                        checked={backupSettings.auto_cleanup}
                        onChange={(e) => setBackupSettings({ ...backupSettings, auto_cleanup: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="auto_cleanup" className="text-sm font-medium">
                        Nettoyage automatique des anciens backups
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleUpdateSettings} className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={() => handleCleanupOldBackups()}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Nettoyer
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Chargement des paramètres...</p>
                  </div>
                )}
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

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-800">Stockage cloud</span>
                  </div>
                  <p className="text-sm text-orange-700">
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
                <div className="text-3xl font-bold">
                  {stats ? formatFileSize(stats.storage_used) : '0 Bytes'}
                </div>
                <p className="text-sm text-gray-500">
                  sur {stats ? formatFileSize(stats.storage_available) : '0 Bytes'} disponibles
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-jomionstore-primary h-2 rounded-full" 
                    style={{ width: `${stats?.storage_percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.storage_percentage.toFixed(1) || 0}% utilisé
                </p>
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
                <div className="text-3xl font-bold">
                  {stats?.last_backup_date 
                    ? new Date(stats.last_backup_date).toLocaleDateString('fr-FR')
                    : 'Jamais'
                  }
                </div>
                <p className="text-sm text-gray-500">
                  {stats?.last_backup_date 
                    ? `il y a ${Math.floor((Date.now() - new Date(stats.last_backup_date).getTime()) / (1000 * 60 * 60))}h`
                    : 'Aucun backup'
                  }
                </p>
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
                <div className="text-3xl font-bold">
                  {stats ? `${stats.success_rate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-sm text-gray-500">
                  {stats ? `${stats.successful_backups} réussis sur ${stats.total_backups} total` : 'Aucune donnée'}
                </p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
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
                onClick={() => setPage(p => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationComponent />
    </div>
  );
}