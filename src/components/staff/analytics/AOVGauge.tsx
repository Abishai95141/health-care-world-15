
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AOVGauge = () => {
  const TARGET_AOV = 500; // Target AOV in rupees

  const { data: aovData, isLoading } = useQuery({
    queryKey: ['aov-gauge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'confirmed');

      if (error) throw error;

      const totalRevenue = data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = data.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      return {
        current: avgOrderValue,
        target: TARGET_AOV,
        percentage: Math.min((avgOrderValue / TARGET_AOV) * 100, 100)
      };
    }
  });

  const gaugeData = [
    { name: 'Current', value: aovData?.percentage || 0, color: '#10B981' },
    { name: 'Remaining', value: 100 - (aovData?.percentage || 0), color: '#F3F4F6' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && aovData) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">Average Order Value</p>
          <p className="text-[#10B981]">Current: ₹{aovData.current.toFixed(0)}</p>
          <p className="text-gray-600">Target: ₹{aovData.target}</p>
          <p className="text-blue-600">{aovData.percentage.toFixed(1)}% of target</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            ₹{aovData?.current.toFixed(0)}
          </div>
          <div className="text-sm text-gray-500">
            {aovData?.percentage.toFixed(1)}% of target
          </div>
        </div>
      </div>
    </motion.div>
  );
};
