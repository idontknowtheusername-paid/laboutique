-- Vérifier les commandes du mois de novembre 2025
SELECT 
  id,
  order_number,
  total_amount,
  status,
  created_at,
  DATE_TRUNC('month', created_at) as mois
FROM orders
WHERE created_at >= '2025-11-01'
ORDER BY created_at DESC;

-- Résumé par mois
SELECT 
  DATE_TRUNC('month', created_at) as mois,
  COUNT(*) as nb_commandes,
  SUM(total_amount) as ca_total
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mois DESC;

-- Vérifier s'il y a des commandes de test (status pending, cancelled, etc.)
SELECT 
  status,
  COUNT(*) as nb,
  SUM(total_amount) as total
FROM orders
WHERE created_at >= '2025-11-01'
GROUP BY status;

-- Commandes avec montants suspects (très élevés ou très bas)
SELECT 
  id,
  order_number,
  total_amount,
  status,
  created_at
FROM orders
WHERE total_amount > 500000 OR total_amount < 1000
ORDER BY total_amount DESC;
