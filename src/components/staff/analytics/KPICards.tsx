
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Calculator, Users, UserPlus, UserCheck, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KPICardsProps {
  onReturningCustomersClick: () => void;
  onNewCustomersClick: () => void;
  onAllCustomersClick: () => void;
  onStockoutClick: () => void;
}

export const KPICards = ({ 
  onReturningCustomersClick, 
  onNewCustomersClick, 
  onAllCustomersClick,
  onStockoutClick 
}: KPICardsProps) => {
  // Fetch KPI data
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: async () => {
      const [revenueRes, ordersRes, customersRes, lowStockRes] = await Promise.all([
        supabase.from('orders').select('total_amount').eq('status', 'confirmed'),
        supabase.from('orders').select('id, created_at').eq('status', 'confirmed'),
        supabase.rpc('get_customer_stats'),
        supabase.from('products').select('id').lte('stock', 10).eq('is_active', true)
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = ordersRes.data?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const customerStats = customersRes.data?.[0] || {
        total_customers: 0,
        new_customers_this_month: 0,
        returning_customers: 0
      };

      const lowStockCount = lowStockRes.data?.length || 0;

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers: customerStats.total_customers || 0,
        newCustomers: customerStats.new_customers_this_month || 0,
        returningCustomers: customerStats.returning_customers || 0,
        lowStockCount
      };
    }
  });

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${(kpiData?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: null
    },
    {
      title: 'Total Orders',
      value: (kpiData?.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: null
    },
    {
      title: 'Average Order Value',
      value: `₹${(kpiData?.avgOrderValue || 0).toFixed(0)}`,
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: null
    },
    {
      title: 'Total Customers',
      value: (kpiData?.totalCustomers || 0).toLocaleString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: onAllCustomersClick
    },
    {
      title: 'New Customers',
      value: (kpiData?.newCustomers || 0).toLocaleString(),
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: onNewCustomersClick
    },
    {
      title: 'Returning Customers',
      value: (kpiData?.returningCustomers || 0).toLocaleString(),
      icon: UserCheck,
      color: 'text-[#10B981]',
      bgColor: 'bg-green-50',
      onClick: onReturningCustomersClick
    },
    {
      title: 'Low Stock Items',
      value: (kpiData?.lowStockCount || 0).toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: onStockoutClick
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((card, index) => (
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
