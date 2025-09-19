'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  delta?: { value: number; tone?: 'up' | 'down' | 'neutral' };
}

export default function StatCard({ icon, label, value, delta }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        {icon && <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-gray-700">{icon}</div>}
        <div className="flex-1">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
        {typeof delta?.value === 'number' && (
          <div className={`text-xs font-medium ${delta.tone === 'down' ? 'text-red-600' : delta.tone === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
            {delta.tone === 'down' ? '▼' : delta.tone === 'up' ? '▲' : '•'} {Math.abs(delta.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

