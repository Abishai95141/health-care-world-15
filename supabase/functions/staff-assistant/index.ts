
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ChatMessage {
  message: string;
  sessionId: string;
  staffUserId: string;
  context?: any;
}

interface GeminiResponse {
  type: 'text' | 'table' | 'chart' | 'action';
  content: string;
  chartSpec?: any;
  actions?: Array<{
    label: string;
    query: string;
  }>;
  insights?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, staffUserId, context }: ChatMessage = await req.json();

    console.log('Staff assistant request:', { message, sessionId, staffUserId });

    // Get comprehensive data context without time restrictions
    const dataContext = await getComprehensiveContext(message);
    
    // Generate enhanced response using Gemini Flash 2.0
    const response = await generateEnhancedGeminiResponse(message, dataContext, context);
    
    // Store conversation in session
    await storeConversation(sessionId, staffUserId, message, response);

    return new Response(JSON.stringify({
      response,
      sessionId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in staff assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I encountered an error processing your request. Please try again.',
      response: {
        type: 'text',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getComprehensiveContext(query: string): Promise<string> {
  try {
    const contexts: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Determine time range based on query or use all-time by default
    let timeFilter = '';
    let dateRange = 'all time';
    
    if (queryLower.includes('today')) {
      timeFilter = `AND DATE(created_at) = CURRENT_DATE`;
      dateRange = 'today';
    } else if (queryLower.includes('yesterday')) {
      timeFilter = `AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`;
      dateRange = 'yesterday';
    } else if (queryLower.includes('this week')) {
      timeFilter = `AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`;
      dateRange = 'this week';
    } else if (queryLower.includes('last week')) {
      timeFilter = `AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week' AND created_at < DATE_TRUNC('week', CURRENT_DATE)`;
      dateRange = 'last week';
    } else if (queryLower.includes('this month')) {
      timeFilter = `AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
      dateRange = 'this month';
    } else if (queryLower.includes('last month')) {
      timeFilter = `AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < DATE_TRUNC('month', CURRENT_DATE)`;
      dateRange = 'last month';
    }
    
    // Always get sales summary for context (with dynamic time range)
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, total_amount, shipping_amount, status, payment_status, created_at,
        order_items (
          quantity, unit_price, total_price,
          products (name, category, brand, price, stock)
        )
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(100); // Increased limit for better analysis

    if (orders && orders.length > 0) {
      // Filter orders based on time range if specified
      let filteredOrders = orders;
      if (timeFilter) {
        const now = new Date();
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          // Apply time filtering logic based on the query
          if (queryLower.includes('today')) {
            return orderDate.toDateString() === now.toDateString();
          } else if (queryLower.includes('this week')) {
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            return orderDate >= weekStart;
          }
          // Add more time filtering as needed
          return true;
        });
      }
      
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const startDate = filteredOrders.length > 0 ? 
        new Date(Math.min(...filteredOrders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString() : 
        'N/A';
      const endDate = filteredOrders.length > 0 ? 
        new Date(Math.max(...filteredOrders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString() : 
        'N/A';
      
      contexts.push(`Sales Summary (${dateRange === 'all time' ? `${startDate} to ${endDate}` : dateRange}):
        - Total Revenue: ₹${totalRevenue.toFixed(2)}
        - Total Orders: ${totalOrders}
        - Average Order Value: ₹${avgOrderValue.toFixed(2)}
        - Date Range: ${dateRange === 'all time' ? `${startDate} to ${endDate} (default: all time)` : dateRange}
        - Sample Recent Orders: ${JSON.stringify(filteredOrders.slice(0, 3))}`);
    }

    // Get product performance data (no time restriction unless specifically requested)
    if (queryLower.includes('product') || queryLower.includes('inventory') || queryLower.includes('stock') || queryLower.includes('top') || queryLower.includes('best')) {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id, name, category, brand, price, mrp, stock, is_active, created_at,
          product_reviews (rating, comment, created_at)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50); // Increased for better analysis
      
      if (products) {
        const productsWithStats = products.map(product => {
          const reviews = product.product_reviews || [];
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;
          
          return {
            ...product,
            avgRating: avgRating.toFixed(1),
            reviewCount: reviews.length,
            stockStatus: product.stock <= 10 ? 'LOW' : product.stock <= 50 ? 'MEDIUM' : 'HIGH'
          };
        });
        
        contexts.push(`Product Performance Data (All Time): ${JSON.stringify(productsWithStats)}`);
      }
    }

    // Get customer analytics (all time by default)
    if (queryLower.includes('customer') || queryLower.includes('user') || queryLower.includes('profile')) {
      const { data: customerStats } = await supabase
        .rpc('get_customer_stats');
      
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(20); // Increased for better analysis
      
      if (customerStats && allProfiles) {
        contexts.push(`Customer Analytics (All Time):
          - Stats: ${JSON.stringify(customerStats)}
          - Recent Customers: ${JSON.stringify(allProfiles)}`);
      }
    }

    // Get category and brand performance (all time)
    if (queryLower.includes('category') || queryLower.includes('brand') || queryLower.includes('performance')) {
      const { data: topCategories } = await supabase
        .rpc('get_top_categories', { limit_count: 15 });
      
      const { data: topBrands } = await supabase
        .rpc('get_top_brands', { limit_count: 15 });
      
      if (topCategories || topBrands) {
        contexts.push(`Performance Data (All Time):
          - Top Categories: ${JSON.stringify(topCategories || [])}
          - Top Brands: ${JSON.stringify(topBrands || [])}`);
      }
    }

    // Get low stock alerts
    if (queryLower.includes('low') || queryLower.includes('stock') || queryLower.includes('alert') || queryLower.includes('inventory')) {
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, category, stock, price')
        .lte('stock', 10)
        .eq('is_active', true)
        .order('stock', { ascending: true });
      
      if (lowStockProducts) {
        contexts.push(`Low Stock Alerts (Current): ${JSON.stringify(lowStockProducts)}`);
      }
    }

    return contexts.join('\n\n');
  } catch (error) {
    console.error('Error getting comprehensive context:', error);
    return 'Unable to fetch complete data context.';
  }
}

async function generateEnhancedGeminiResponse(message: string, context: string, previousContext?: any): Promise<GeminiResponse> {
  const systemPrompt = `You are HealthCareWorld's Master Interactive Data Analyst. Follow these rules:

CORE PRINCIPLES:
1. Always interpret the user's intent and compute exact metrics from the database
2. Provide narrative summaries before any data tables or charts
3. Return structured JSON responses with appropriate visualizations
4. Suggest relevant follow-up actions after each response
5. Ask clarifying questions when queries are ambiguous
6. When summarizing data, always mention the date range: "Here are the figures from [start_date] to [end_date] (default: all time)" unless a specific time period was requested

RESPONSE FORMAT:
Always return valid JSON with these fields:
- type: "text"|"table"|"chart"|"action"
- content: Narrative summary + data (markdown format for tables)
- chartSpec: Recharts configuration object (when type="chart")
- actions: Array of follow-up suggestion buttons
- insights: Array of key insights or anomalies

DATA ANALYSIS RULES:
- For sales queries: compute revenue, order count, AOV, growth rates
- For product queries: include stock levels, ratings, performance metrics
- For time-based queries: use the full dataset unless specific time range requested
- Always highlight trends, anomalies, and key insights
- Include actual numbers and percentages in narratives
- DEFAULT to all-time data unless user specifies a time period

CHART SPECIFICATIONS:
- Use Recharts format for chartSpec
- Supported chart types: line, bar, pie, area, radialbar, gauge, funnel, scatter, composed
- Include proper data arrays and configuration
- Make charts meaningful and insightful
- Example chartSpec format:
  {
    "type": "bar",
    "data": [{"name": "Product A", "value": 1200}, {"name": "Product B", "value": 800}],
    "xKey": "name",
    "yKey": "value"
  }

FOLLOW-UP ACTIONS:
- Suggest 2-3 relevant next steps as quick-reply buttons
- Include drill-down options and comparative analysis
- Offer export or detailed view options when appropriate

Current data context: ${context}

Previous conversation context: ${JSON.stringify(previousContext || {})}

IMPORTANT: When providing summaries, always state the date range clearly. If no specific time period was requested, mention "default: all time" in your response.

Respond only with valid JSON in the exact format specified.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Query: ${message}\n\nProvide a comprehensive analysis with narrative, data, and actionable insights in JSON format. Include chartSpec for visualizations when appropriate.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let geminiText = data.candidates[0].content.parts[0].text;
    
    // Clean up response to extract JSON
    geminiText = geminiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedResponse = JSON.parse(geminiText);
      
      // Ensure required fields exist
      return {
        type: parsedResponse.type || 'text',
        content: parsedResponse.content || geminiText,
        chartSpec: parsedResponse.chartSpec,
        actions: parsedResponse.actions || [],
        insights: parsedResponse.insights || []
      };
    } catch (parseError) {
      // Fallback response with enhanced structure
      return {
        type: 'text',
        content: `Based on your query about "${message}", here's what I found:\n\n${geminiText}`,
        actions: [
          { label: "Show detailed breakdown", query: `Show me a detailed breakdown of ${message}` },
          { label: "Compare with different period", query: `Compare ${message} with different time periods` }
        ],
        insights: ["Analysis completed successfully"]
      };
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      type: 'text',
      content: 'I can help you analyze business data, sales performance, inventory levels, and customer insights across your entire dataset. What specific metrics would you like to explore?',
      actions: [
        { label: "All-Time Sales Summary", query: "Show me comprehensive sales summary" },
        { label: "Current Stock Status", query: "What's our current inventory status?" },
        { label: "Product Performance Analysis", query: "Show all-time top performing products" }
      ],
      insights: ["Ready to analyze your complete business data"]
    };
  }
}

async function storeConversation(sessionId: string, staffUserId: string, userMessage: string, assistantResponse: GeminiResponse) {
  try {
    const { data: existingSession } = await supabase
      .from('staff_chat_sessions')
      .select('session_data')
      .eq('id', sessionId)
      .single();

    const currentData = existingSession?.session_data || [];
    const newEntry = {
      timestamp: new Date().toISOString(),
      userMessage,
      assistantResponse,
      type: 'exchange'
    };

    const updatedData = [...currentData, newEntry];

    await supabase
      .from('staff_chat_sessions')
      .upsert({
        id: sessionId,
        staff_user_id: staffUserId,
        session_data: updatedData,
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error storing conversation:', error);
  }
}
