
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, UserCheck, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerEngagementCardsProps {
  onNewCustomersClick: () => void;
  onReturningCustomersClick: () => void;
  onAllCustomersClick: () => void;
  onRatingsClick: () => void;
}

export const CustomerEngagementCards = ({ 
  onNewCustomersClick, 
  onReturningCustomersClick, 
  onAllCustomersClick,
  onRatingsClick 
}: CustomerEngagementCardsProps) => {
  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customer-engagement'],
    queryFn: async () => {
      const [customersRes, ratingsRes] = await Promise.all([
        supabase.rpc('get_customer_stats'),
        supabase.from('product_reviews').select('rating')
      ]);

      const avgRating = ratingsRes.data?.length ? 
        ratingsRes.data.reduce((sum, review) => sum + review.rating, 0) / ratingsRes.data.length : 0;

      const customerStats = customersRes.data?.[0] || {
        total_customers: 0,
        new_customers_this_month: 0,
        returning_customers: 0
      };

      return {
        totalCustomers: customerStats.total_customers || 0,
        newCustomers: customerStats.new_customers_this_month || 0,
        returningCustomers: customerStats.returning_customers || 0,
        avgRating
      };
    }
  });

  const customerCards = [
    {
      title: 'New Customers',
      value: (customerData?.newCustomers || 0).toLocaleString(),
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: onNewCustomersClick
    },
    {
      title: 'Returning Customers',
      value: (customerData?.returningCustomers || 0).toLocaleString(),
      icon: UserCheck,
      color: 'text-[#10B981]',
      bgColor: 'bg-green-50',
      onClick: onReturningCustomersClick
    },
    {
      title: 'Total Active Customers',
      value: (customerData?.totalCustomers || 0).toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: onAllCustomersClick
    },
    {
      title: 'Average Customer Rating',
      value: `${(customerData?.avgRating || 0).toFixed(1)}★`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: onRatingsClick
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {customerCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card 
            className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border-l-4 border-l-[#10B981] cursor-pointer"
            onClick={card.onClick}
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
