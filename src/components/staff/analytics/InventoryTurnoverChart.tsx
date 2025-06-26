
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const InventoryTurnoverChart = () => {
  const { data: turnoverData, isLoading } = useQuery({
    queryKey: ['inventory-turnover'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category, stock, price');

      if (error) throw error;

      // Group by category and calculate turnover metrics
      const categoryData = data.reduce((acc: any, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            totalStock: 0,
            totalValue: 0,
            productCount: 0
          };
        }
        acc[product.category].totalStock += product.stock;
        acc[product.category].totalValue += product.stock * product.price;
        acc[product.category].productCount += 1;
        return acc;
      }, {});

      return Object.entries(categoryData).map(([category, data]: [string, any]) => ({
        category: category.length > 15 ? category.substring(0, 15) + '...' : category,
        turnoverRate: data.totalValue / Math.max(data.totalStock, 1), // Simplified turnover calculation
        stockValue: data.totalValue,
        products: data.productCount
      }));
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-[#10B981]">
            Turnover Rate: ₹{data.turnoverRate.toFixed(2)}
          </p>
          <p className="text-blue-600">
            Stock Value: ₹{data.stockValue.toLocaleString()}
          </p>
          <p className="text-gray-600">
            Products: {data.products}
          </p>
        </div>
      );
    }
    return null;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={turnoverData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="turnoverRate" 
            fill="#10B981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
