
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CategoryPerformanceChartProps {
  onCategoryClick: (category: string) => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const CategoryPerformanceChart = ({ onCategoryClick }: CategoryPerformanceChartProps) => {
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category-performance'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_categories', { limit_count: 6 });
      if (error) throw error;
      
      return data?.map((item, index) => ({
        name: item.category,
        value: item.total_revenue || 0,
        sales: item.total_sales || 0,
        color: COLORS[index % COLORS.length]
      })) || [];
    }
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-[#10B981]">Revenue: ₹{data.value.toLocaleString()}</p>
          <p className="text-blue-600">Sales: {data.sales}</p>
        </div>
      );
    }
    return null;
  };

  const CustomCell = ({ payload, ...props }: any) => (
    <Cell 
      {...props}
      className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
      onClick={() => onCategoryClick(payload.name)}
    />
  );

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
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {categoryData?.map((entry, index) => (
              <CustomCell 
                key={`cell-${index}`} 
                fill={entry.color}
                payload={entry}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
