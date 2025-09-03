'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesChartProps {
  data: Array<{ _id: string; revenue: number; orders: number }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map(item => ({
    date: new Date(item._id).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes des 30 derniers jours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `${value}€` : value,
                name === 'revenue' ? 'Chiffre d\'affaires' : 'Commandes'
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface OrderStatusChartProps {
  data: Array<{ _id: string; count: number }>;
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const COLORS = {
    'en_attente': 'hsl(var(--destructive))',
    'payé': 'hsl(var(--chart-1))',
    'livré': 'hsl(var(--chart-2))',
    'annulé': 'hsl(var(--muted-foreground))',
  };

  const chartData = data.map(item => ({
    name: item._id === 'en_attente' ? 'En attente' :
          item._id === 'payé' ? 'Payé' :
          item._id === 'livré' ? 'Livré' :
          item._id === 'annulé' ? 'Annulé' : item._id,
    value: item.count,
    color: COLORS[item._id as keyof typeof COLORS] || 'hsl(var(--primary))',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statuts des commandes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface TopProductsChartProps {
  data: Array<{ name: string; sales: number }>;
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits les plus vendus</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}