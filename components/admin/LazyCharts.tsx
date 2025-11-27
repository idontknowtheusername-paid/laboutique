'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

// Re-export all Recharts components for lazy loading
export {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
};

// Chart Skeleton component
export const ChartSkeleton = () => (
  <div className="min-h-[300px] flex items-center justify-center">
    <div className="w-full h-[280px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Chargement du graphique...</span>
    </div>
  </div>
);
