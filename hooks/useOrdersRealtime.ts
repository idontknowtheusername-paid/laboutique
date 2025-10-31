import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Order } from '@/lib/services/orders.service';

export function useOrdersRealtime(initialOrders: Order[] = []) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Mettre à jour les commandes initiales
    setOrders(initialOrders);

    // Créer la souscription en temps réel
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Changement détecté sur les commandes:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setOrders(prev => [payload.new as Order, ...prev]);
              break;
              
            case 'UPDATE':
              setOrders(prev => 
                prev.map(order => 
                  order.id === payload.new.id 
                    ? { ...order, ...payload.new } as Order
                    : order
                )
              );
              break;
              
            case 'DELETE':
              setOrders(prev => 
                prev.filter(order => order.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // Nettoyage lors du démontage
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrders, supabase]);

  return orders;
}

export function useOrderRealtime(orderId: string, initialOrder?: Order) {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }

    // Créer la souscription pour une commande spécifique
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Commande mise à jour:', payload);
          setOrder(prev => prev ? { ...prev, ...payload.new } as Order : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, initialOrder, supabase]);

  return order;
}