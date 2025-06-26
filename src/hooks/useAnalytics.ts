
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  // Get daily sales data
  const getDailySales = () => {
    return useQuery({
      queryKey: ['daily-sales'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('status', 'confirmed')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        // Group by date
        const salesByDate = data.reduce((acc: any, order) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { total_revenue: 0, total_orders: 0 };
          }
          acc[date].total_revenue += order.total_amount || 0;
          acc[date].total_orders += 1;
          return acc;
        }, {});

        return Object.entries(salesByDate).map(([date, data]: [string, any]) => ({
          sale_date: date,
          total_revenue: data.total_revenue,
          total_orders: data.total_orders,
          avg_order_value: data.total_orders > 0 ? data.total_revenue / data.total_orders : 0
        }));
      }
    });
  };

  return {
    getDailySales
  };
};
