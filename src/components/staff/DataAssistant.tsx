
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageCircle, Loader2, User, Bot, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart,
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responseType?: 'text' | 'table' | 'chart' | 'action';
  chartSpec?: any;
  actions?: Array<{ label: string; query: string }>;
  insights?: string[];
}

interface DrillDownData {
  title: string;
  data: any[];
  type: 'table' | 'chart';
  chartConfig?: any;
}

const DataAssistant = () => {
  const navigate = useNavigate();
  const { user } = useStaffAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [conversationContext, setConversationContext] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([{
      id: '1',
      type: 'assistant',
      content: '👋 **Welcome to your Master Data Assistant!**\n\nI\'m here to help you analyze and understand your business data. I can provide:\n\n• **Sales Analytics** - Revenue, orders, trends, and growth metrics\n• **Product Insights** - Performance, inventory, ratings, and recommendations\n• **Customer Analysis** - Behavior patterns, segmentation, and retention\n• **Operational Metrics** - Stock levels, alerts, and forecasting\n\nWhat would you like to explore today?',
      timestamp: new Date().toISOString(),
      responseType: 'text',
      actions: [
        { label: "📊 Today's Sales Summary", query: "Show me today's sales summary with trends" },
        { label: "⚠️ Low Stock Alerts", query: "What products are running low on stock?" },
        { label: "🏆 Top Performing Products", query: "Show me top performing products by revenue" },
        { label: "👥 Customer Insights", query: "Give me customer analytics and insights" },
        { label: "📈 This Week vs Last Week", query: "Compare this week vs last week sales performance" }
      ]
    }]);
  }, []);

  const handleSend = async (messageText?: string) => {
    const queryText = messageText || input.trim();
    if (!queryText || isLoading || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: queryText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('staff-assistant', {
        body: {
          message: queryText,
          sessionId,
          staffUserId: user.id,
          context: conversationContext
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: data.response.content,
        timestamp: data.timestamp,
        responseType: data.response.type,
        chartSpec: data.response.chartSpec,
        actions: data.response.actions || [],
        insights: data.response.insights || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation context
      setConversationContext(prev => ({
        ...prev,
        lastQuery: queryText,
        lastResponse: data.response,
        timestamp: data.timestamp
      }));

    } catch (error) {
      console.error('Error calling assistant:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error analyzing your request. Please try again with a different query.',
        timestamp: new Date().toISOString(),
        responseType: 'text',
        actions: [
          { label: "Try Sales Summary", query: "Show me sales summary" },
          { label: "Check Inventory", query: "Show inventory status" }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderChart = (chartSpec: any) => {
    if (!chartSpec || !chartSpec.data || !Array.isArray(chartSpec.data)) {
      return <div className="text-sm text-gray-500">No chart data available</div>;
    }

    const colors = ['#27AE60', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'];
    const { data, type, xKey = 'name', yKey = 'value' } = chartSpec;

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-medium text-gray-900 mb-1">{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (type?.toLowerCase()) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#27AE60" 
                strokeWidth={2}
                dot={{ fill: '#27AE60', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#27AE60', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={yKey} fill="#27AE60" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie 
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey={yKey}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke="#27AE60" 
                fill="#27AE60" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radialbar':
      case 'gauge':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={data}>
              <RadialBar dataKey={yKey} cornerRadius={10} fill="#27AE60" />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel dataKey={yKey} data={data} isAnimationActive>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis dataKey={yKey} stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter fill="#27AE60" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={yKey} fill="#27AE60" />
              <Line type="monotone" dataKey={yKey} stroke="#3498DB" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={yKey} fill="#27AE60" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#27AE60] to-[#229954] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div className={`max-w-[85%] ${isUser ? 'max-w-[70%]' : ''}`}>
          <Card className={`p-4 ${
            isUser 
              ? 'bg-gradient-to-br from-[#27AE60] to-[#229954] text-white border-none shadow-lg' 
              : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className={`text-xs ${
                isUser ? 'text-white/80' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.includes('**') ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }} />
                    ) : line.includes('•') ? (
                      <div className="ml-2">{line}</div>
                    ) : (
                      line
                    )}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              
              {message.insights && message.insights.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                >
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Key Insights
                  </div>
                  {message.insights.map((insight, idx) => (
                    <div key={idx} className="text-sm text-blue-700">• {insight}</div>
                  ))}
                </motion.div>
              )}
              
              {message.chartSpec && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
                    <BarChart3 className="w-4 h-4" />
                    Data Visualization
                  </div>
                  {renderChart(message.chartSpec)}
                </motion.div>
              )}
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-600">Quick Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white hover:bg-gray-50 border-gray-300"
                        onClick={() => handleSend(action.query)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#27AE60] to-[#229954] rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Master Data Assistant</h1>
                <p className="text-sm text-gray-500">Interactive Business Analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Quick Actions */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Quick Analytics</h3>
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sales & Revenue</h4>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-auto p-3 hover:bg-gray-50"
                onClick={() => handleSend('Show me today\'s sales summary with revenue trends')}
              >
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                <div className="text-left">
                  <div>Today's Sales</div>
                  <div className="text-xs text-gray-500">Revenue & trends</div>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-auto p-3 hover:bg-gray-50"
                onClick={() => handleSend('Compare this week vs last week sales performance')}
              >
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <div>Weekly Comparison</div>
                  <div className="text-xs text-gray-500">Week over week</div>
                </div>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inventory & Products</h4>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-auto p-3 hover:bg-gray-50"
                onClick={() => handleSend('What products are low in stock and need immediate attention?')}
              >
                <Activity className="w-4 h-4 mr-2 text-red-600" />
                <div className="text-left">
                  <div>Low Stock Alert</div>
                  <div className="text-xs text-gray-500">Inventory status</div>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-auto p-3 hover:bg-gray-50"
                onClick={() => handleSend('Show me top performing products by revenue and ratings')}
              >
                <PieChart className="w-4 h-4 mr-2 text-purple-600" />
                <div className="text-left">
                  <div>Top Products</div>
                  <div className="text-xs text-gray-500">Performance metrics</div>
                </div>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Customer Analytics</h4>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm h-auto p-3 hover:bg-gray-50"
                onClick={() => handleSend('Give me customer insights including new vs returning customers')}
              >
                <User className="w-4 h-4 mr-2 text-orange-600" />
                <div className="text-left">
                  <div>Customer Insights</div>
                  <div className="text-xs text-gray-500">Behavior analysis</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area - Scrollable */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence>
                {messages.map(renderMessage)}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start mb-6"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#27AE60] to-[#229954] rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <Card className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#27AE60]" />
                      <span className="text-gray-600">Analyzing your data...</span>
                    </div>
                  </Card>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Fixed Input Bar */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about sales, inventory, customers, or any business metrics..."
                  className="flex-1 focus:ring-[#27AE60] focus:border-[#27AE60] h-12"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#27AE60] hover:bg-[#229954] px-6 h-12 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;
