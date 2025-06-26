
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  Calculator, 
  Users, 
  UserPlus, 
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  Package
} from 'lucide-react';
import { KPICards } from '@/components/staff/analytics/KPICards';
import { SalesTrendChart } from '@/components/staff/analytics/SalesTrendChart';
import { CategoryPerformanceChart } from '@/components/staff/analytics/CategoryPerformanceChart';
import { CartConversionFunnel } from '@/components/staff/analytics/CartConversionFunnel';
import { TopProductsSection } from '@/components/staff/analytics/TopProductsSection';
import { ReturningCustomersDrawer } from '@/components/staff/analytics/ReturningCustomersDrawer';
import { CategoryProductsModal } from '@/components/staff/analytics/CategoryProductsModal';
import { SalesDetailPanel } from '@/components/staff/analytics/SalesDetailPanel';

const Analytics = () => {
  const [isReturningCustomersOpen, setIsReturningCustomersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your business performance</p>
          </motion.div>

          {/* KPI Cards */}
          <KPICards onReturningCustomersClick={() => setIsReturningCustomersOpen(true)} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border-l-4 border-l-[#10B981]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-[#10B981]" />
                    Sales Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesTrendChart onDataPointClick={setSelectedDate} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <PieChart className="h-6 w-6 text-[#10B981]" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryPerformanceChart onCategoryClick={setSelectedCategory} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Cart Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-[#10B981]" />
                    Cart Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CartConversionFunnel />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sales Detail Panel */}
          <AnimatePresence>
            {selectedDate && (
              <SalesDetailPanel 
                date={selectedDate} 
                onClose={() => setSelectedDate(null)} 
              />
            )}
          </AnimatePresence>

          {/* Top Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <Package className="h-6 w-6 text-[#10B981]" />
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopProductsSection />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Drawers and Modals */}
      <ReturningCustomersDrawer 
        open={isReturningCustomersOpen}
        onClose={() => setIsReturningCustomersOpen(false)}
      />

      <CategoryProductsModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  );
};

export default Analytics;
