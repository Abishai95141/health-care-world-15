
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SalesTrendChartProps {
  onDataPointClick: (date: string) => void;
}

export const SalesTrendChart = ({ onDataPointClick }: SalesTrendChartProps) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-trend', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_sales');
      if (error) throw error;
      
      return data?.map(item => ({
        date: new Date(item.sale_date).toLocaleDateString(),
        revenue: item.total_revenue || 0,
        orders: item.total_orders || 0,
        avgOrderValue: item.avg_order_value || 0
      })).slice(-30) || []; // Last 30 days
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-[#10B981]">
            Revenue: ₹{payload[0]?.value?.toLocaleString() || 0}
          </p>
          <p className="text-blue-600">
            Orders: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleDataPointClick = (data: any) => {
    if (data && data.date) {
      onDataPointClick(data.date);
    }
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              period === p
                ? 'bg-[#10B981] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salesData} onClick={handleDataPointClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="revenue"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
          />
          <YAxis 
            yAxisId="orders"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            name="Revenue (₹)"
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
