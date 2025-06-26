
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

    // Get comprehensive data context
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
    
    // Always get recent sales summary for context
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id, total_amount, shipping_amount, status, payment_status, created_at,
        order_items (
          quantity, unit_price, total_price,
          products (name, category, brand, price, stock)
        )
      `)
      .eq('status', 'confirmed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (recentOrders) {
      const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = recentOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      contexts.push(`Recent 7 Days Sales Summary:
        - Total Revenue: ₹${totalRevenue.toFixed(2)}
        - Total Orders: ${totalOrders}
        - Average Order Value: ₹${avgOrderValue.toFixed(2)}
        - Sample Recent Orders: ${JSON.stringify(recentOrders.slice(0, 3))}`);
    }

    // Get product performance data
    if (queryLower.includes('product') || queryLower.includes('inventory') || queryLower.includes('stock') || queryLower.includes('top') || queryLower.includes('best')) {
      const { data: products } = await supabase
        .from('products')
        .select(`
          id, name, category, brand, price, mrp, stock, is_active, created_at,
          product_reviews (rating, comment, created_at)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);
      
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
        
        contexts.push(`Product Performance Data: ${JSON.stringify(productsWithStats)}`);
      }
    }

    // Get customer analytics
    if (queryLower.includes('customer') || queryLower.includes('user') || queryLower.includes('profile')) {
      const { data: customerStats } = await supabase
        .rpc('get_customer_stats');
      
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (customerStats && recentProfiles) {
        contexts.push(`Customer Analytics:
          - Stats: ${JSON.stringify(customerStats)}
          - Recent Customers: ${JSON.stringify(recentProfiles)}`);
      }
    }

    // Get category and brand performance
    if (queryLower.includes('category') || queryLower.includes('brand') || queryLower.includes('performance')) {
      const { data: topCategories } = await supabase
        .rpc('get_top_categories', { limit_count: 10 });
      
      const { data: topBrands } = await supabase
        .rpc('get_top_brands', { limit_count: 10 });
      
      if (topCategories || topBrands) {
        contexts.push(`Performance Data:
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
        contexts.push(`Low Stock Alerts: ${JSON.stringify(lowStockProducts)}`);
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
- For time-based queries: assume last 7 days if no range specified, and mention this assumption
- Always highlight trends, anomalies, and key insights
- Include actual numbers and percentages in narratives

CHART SPECIFICATIONS:
- Use Recharts format for chartSpec
- Common chart types: LineChart, BarChart, PieChart, AreaChart
- Include proper data arrays and configuration
- Make charts meaningful and insightful

FOLLOW-UP ACTIONS:
- Suggest 2-3 relevant next steps as quick-reply buttons
- Include drill-down options and comparative analysis
- Offer export or detailed view options when appropriate

Current data context: ${context}

Previous conversation context: ${JSON.stringify(previousContext || {})}

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
            text: `${systemPrompt}\n\nUser Query: ${message}\n\nProvide a comprehensive analysis with narrative, data, and actionable insights in JSON format.`
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
          { label: "Compare with last period", query: `Compare ${message} with previous period` }
        ],
        insights: ["Analysis completed successfully"]
      };
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      type: 'text',
      content: 'I can help you analyze business data, sales performance, inventory levels, and customer insights. What specific metrics would you like to explore?',
      actions: [
        { label: "Today's Sales Summary", query: "Show me today's sales summary" },
        { label: "Low Stock Alerts", query: "What products are low in stock?" },
        { label: "Top Performing Products", query: "Show top performing products" }
      ],
      insights: ["Ready to analyze your business data"]
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
