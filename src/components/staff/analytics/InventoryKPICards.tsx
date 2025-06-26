
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InventoryKPICardsProps {
  onExpiringProductsClick: () => void;
}

export const InventoryKPICards = ({ onExpiringProductsClick }: InventoryKPICardsProps) => {
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-kpis'],
    queryFn: async () => {
      const [stockValueRes, expiringRes] = await Promise.all([
        supabase.from('products').select('stock, price').eq('is_active', true),
        supabase.from('products').select('id, name, expiration_date')
          .eq('is_active', true)
          .not('expiration_date', 'is', null)
          .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalStockValue = stockValueRes.data?.reduce((sum, product) => 
        sum + (product.stock * product.price), 0) || 0;

      return {
        totalStockValue,
        expiringCount: expiringRes.data?.length || 0
      };
    }
  });

  const inventoryCards = [
    {
      title: 'Total Stock Value',
      value: `₹${(inventoryData?.totalStockValue || 0).toLocaleString()}`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: null
    },
    {
      title: 'Products Nearing Expiration',
      value: (inventoryData?.expiringCount || 0).toLocaleString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: onExpiringProductsClick
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {inventoryCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card 
            className={`shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border-l-4 border-l-[#10B981] ${
              card.onClick ? 'cursor-pointer' : ''
            }`}
            onClick={card.onClick || undefined}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <div className="flex items-center space-x-2">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    )}
                  </div>
                </div>
                <div className={`${card.bgColor} p-3 rounded-2xl`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
