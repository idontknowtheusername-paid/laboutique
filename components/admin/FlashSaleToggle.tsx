'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Zap, Settings, Save, X } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface FlashSaleToggleProps {
  productId: string;
  productName: string;
  currentPrice: number;
  isFlashSale?: boolean;
  flashPrice?: number;
  flashEndDate?: string;
  discountPercentage?: number;
  timeLeft?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  onUpdate?: () => void;
}

export default function FlashSaleToggle({
  productId,
  productName,
  currentPrice,
  isFlashSale = false,
  flashPrice = 0,
  flashEndDate,
  discountPercentage = 0,
  timeLeft,
  onUpdate
}: FlashSaleToggleProps) {
  const [enabled, setEnabled] = useState(isFlashSale);
  const [price, setPrice] = useState(flashPrice || currentPrice * 0.8);
  const [duration, setDuration] = useState('24');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    setEnabled(isFlashSale);
    setPrice(flashPrice || currentPrice * 0.8);
  }, [isFlashSale, flashPrice, currentPrice]);

  const calculateDiscount = (flashPrice: number) => {
    return Math.round(((currentPrice - flashPrice) / currentPrice) * 100);
  };

  const handleToggle = async (newEnabled: boolean) => {
    if (!newEnabled) {
      // Désactiver directement
      await updateFlashSale(false);
      return;
    }

    // Activer - mettre à jour l'état local immédiatement pour le feedback visuel
    setEnabled(true);
    // Puis ouvrir la config
    setShowConfig(true);
  };

  const updateFlashSale = async (enable: boolean, customPrice?: number, customDuration?: string, customMaxQuantity?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/flash-sale`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: enable,
          flash_price: enable ? (customPrice || price) : null,
          duration_hours: enable && customDuration ? parseInt(customDuration) : null,
          max_quantity: enable && customMaxQuantity ? parseInt(customMaxQuantity) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setEnabled(enable);
        success(
          enable ? 'Vente flash activée' : 'Vente flash désactivée',
          `${productName} ${enable ? 'est maintenant en vente flash' : 'n\'est plus en vente flash'}`
        );
        setShowConfig(false);
        onUpdate?.();
      } else {
        error('Erreur', data.error || 'Impossible de mettre à jour la vente flash');
      }
    } catch (err) {
      error('Erreur', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (price <= 0 || price >= currentPrice) {
      error('Prix invalide', 'Le prix flash doit être inférieur au prix normal');
      return;
    }
    updateFlashSale(true, price, duration, maxQuantity);
  };

  const formatTimeLeft = () => {
    if (!timeLeft) return null;
    return `${timeLeft.hours}h${timeLeft.minutes.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={loading}
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        )}
      </div>

      {enabled && (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            -{discountPercentage}%
          </Badge>

          {timeLeft && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeLeft()}
            </Badge>
          )}

          <Popover open={showConfig} onOpenChange={setShowConfig}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Configuration Vente Flash</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowConfig(false);
                      // Si on ferme sans sauvegarder et que c'était une nouvelle activation, revenir à l'état précédent
                      if (!isFlashSale) {
                        setEnabled(false);
                      }
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Prix flash</label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Prix en XOF"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Prix normal: {currentPrice.toLocaleString()} XOF</span>
                      <span className="text-red-600">-{calculateDiscount(price)}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Durée</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 heures</SelectItem>
                        <SelectItem value="12">12 heures</SelectItem>
                        <SelectItem value="24">24 heures</SelectItem>
                        <SelectItem value="48">48 heures</SelectItem>
                        <SelectItem value="72">3 jours</SelectItem>
                        <SelectItem value="168">1 semaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Stock max (optionnel)</label>
                    <Input
                      type="number"
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(e.target.value)}
                      placeholder="Limite de vente"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Sauvegarde...' : 'Activer'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConfig(false);
                        // Si on annule et que c'était une nouvelle activation, revenir à l'état précédent
                        if (!isFlashSale) {
                          setEnabled(false);
                        }
                      }}
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {!enabled && (
        <span className="text-xs text-gray-400">Inactif</span>
      )}
    </div>
  );
}
