
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    image_urls: string[] | null;
  };
}

interface Order {
  id: string;
  total_amount: number;
  shipping_amount: number | null;
  created_at: string;
  order_items: OrderItem[];
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user || !orderId) {
      console.log('Missing user or orderId:', { user: !!user, orderId });
      setError('Invalid order access');
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [user, orderId, retryCount]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order:', orderId, 'for user:', user!.id, 'attempt:', retryCount + 1);
      
      // Progressive delay for retries
      const delay = retryCount * 1000 + 1000; // 1s, 2s, 3s, etc.
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try multiple approaches to fetch the order
      
      // First, try to fetch the order directly
      let orderData = null;
      let orderError = null;

      // Approach 1: Direct order fetch with joins
      const { data: directOrderData, error: directOrderError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          shipping_amount,
          created_at,
          user_id
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (directOrderError) {
        console.error('Direct order fetch error:', directOrderError);
      } else if (directOrderData) {
        console.log('Direct order data found:', directOrderData);
        
        // Check if this order belongs to the current user
        if (directOrderData.user_id !== user!.id) {
          setError('You do not have permission to view this order');
          setLoading(false);
          return;
        }

        // Now fetch order items separately
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product:products (
              name,
              image_urls
            )
          `)
          .eq('order_id', orderId);

        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
        } else {
          orderData = {
            ...directOrderData,
            order_items: itemsData || []
          };
        }
      }

      // If direct approach failed, try alternative approach
      if (!orderData) {
        console.log('Trying alternative fetch approach...');
        
        // Approach 2: Fetch through user's orders
        const { data: userOrdersData, error: userOrdersError } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            shipping_amount,
            created_at
          `)
          .eq('user_id', user!.id)
          .eq('id', orderId)
          .maybeSingle();

        if (userOrdersError) {
          console.error('User orders fetch error:', userOrdersError);
        } else if (userOrdersData) {
          console.log('User order data found:', userOrdersData);
          
          // Fetch items for this order
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              product:products (
                name,
                image_urls
              )
            `)
            .eq('order_id', orderId);

          if (!itemsError) {
            orderData = {
              ...userOrdersData,
              order_items: itemsData || []
            };
          }
        }
      }

      if (orderData) {
        console.log('Order fetched successfully:', orderData);
        setOrder(orderData);
        setError(null);
      } else {
        console.log('Order not found, retry count:', retryCount);
        
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          return; // This will trigger useEffect again
        } else {
          setError('Order not found or you do not have permission to view it');
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      
      // Retry on error
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        return;
      } else {
        setError('Failed to load order details after multiple attempts');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const subtotal = order ? order.total_amount - (order.shipping_amount || 0) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-black mx-auto mb-6" />
            <p className="text-gray-600 text-lg">
              Loading order details... {retryCount > 0 && `(Attempt ${retryCount + 1})`}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-12 text-center">
            <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-light text-black mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {error || "We couldn't find the order you're looking for or you don't have permission to view it."}
            </p>
            <div className="space-y-4">
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full border-gray-200 hover:border-black hover:bg-black hover:text-white 
                         h-12 text-lg rounded-full hover:scale-105 transition-all duration-200"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/shop')}
                className="w-full bg-black hover:bg-gray-800 text-white h-12 text-lg rounded-full 
                         hover:scale-105 transition-all duration-200"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Success Header */}
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center mb-12">
            <CheckCircle className="h-20 w-20 text-black mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-light text-black mb-4 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-gray-600 text-xl">
              Your order has been confirmed and is being prepared for delivery.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-12">
            <div className="border-b border-gray-100 pb-8 mb-10">
              <h2 className="text-2xl lg:text-3xl font-light text-black mb-4">Order Summary</h2>
              <div className="space-y-2 text-gray-600 text-lg">
                <p><span className="font-medium text-black">Order #:</span> {order.id}</p>
                <p><span className="font-medium text-black">Order Date:</span> {formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-6 mb-10">
              {order.order_items && order.order_items.length > 0 ? order.order_items.map((item) => (
                <div key={item.id} className="flex items-center space-x-6 py-6 border-b border-gray-50 last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                    {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">No Image</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-black text-lg mb-2">{item.product?.name || 'Unknown Product'}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-black text-lg">₹{item.unit_price}</p>
                    <p className="text-gray-600">Unit Price</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-black text-xl">₹{item.total_price}</p>
                    <p className="text-gray-600">Total</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No items found for this order</p>
                </div>
              )}
            </div>

            {/* Order Totals */}
            <div className="border-t border-gray-100 pt-8">
              <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-black">₹{subtotal}</span>
                </div>
                {order.shipping_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-black">₹{order.shipping_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl lg:text-2xl font-semibold border-t border-gray-100 pt-4">
                  <span className="text-black">Total</span>
                  <span className="text-black">₹{order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              onClick={() => navigate('/shop')}
              className="flex-1 bg-black hover:bg-gray-800 text-white h-14 text-lg rounded-full 
                       hover:scale-105 transition-all duration-200"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="flex-1 border-gray-200 hover:border-black hover:bg-black hover:text-white 
                       h-14 text-lg rounded-full hover:scale-105 transition-all duration-200"
            >
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
