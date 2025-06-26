
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
}

interface GeminiResponse {
  type: 'text' | 'table' | 'chart' | 'action';
  content: string;
  chartSpec?: any;
  action?: {
    name: string;
    payload: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, staffUserId }: ChatMessage = await req.json();

    console.log('Staff assistant request:', { message, sessionId, staffUserId });

    // Get relevant context using RAG
    const context = await getRelevantContext(message);
    
    // Generate response using Gemini Flash 2.0
    const response = await generateGeminiResponse(message, context);
    
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

async function getRelevantContext(query: string): Promise<string> {
  try {
    // Generate embedding for the query (simplified - in production you'd use actual embeddings)
    // For now, we'll do text-based matching on key business data
    
    const contexts: string[] = [];
    
    // Get product data if query relates to products/inventory
    if (query.toLowerCase().includes('product') || query.toLowerCase().includes('inventory') || query.toLowerCase().includes('stock')) {
      const { data: products } = await supabase
        .from('products')
        .select('name, category, brand, stock, price, mrp')
        .limit(10);
      
      if (products) {
        contexts.push(`Recent Products Data: ${JSON.stringify(products.slice(0, 5))}`);
      }
    }
    
    // Get sales/order data if query relates to revenue/sales
    if (query.toLowerCase().includes('sale') || query.toLowerCase().includes('revenue') || query.toLowerCase().includes('order')) {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (orders) {
        contexts.push(`Recent Orders Data: ${JSON.stringify(orders.slice(0, 5))}`);
      }
    }
    
    // Get customer data if query relates to customers
    if (query.toLowerCase().includes('customer') || query.toLowerCase().includes('user')) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name, email, created_at')
        .limit(10);
      
      if (profiles) {
        contexts.push(`Customer Data Sample: ${JSON.stringify(profiles.slice(0, 5))}`);
      }
    }
    
    return contexts.join('\n\n');
  } catch (error) {
    console.error('Error getting context:', error);
    return '';
  }
}

async function generateGeminiResponse(message: string, context: string): Promise<GeminiResponse> {
  const systemPrompt = `You are the Master Data Assistant for HealthCareWorld's Staff Portal. Follow these rules:

1. Intent Parsing: Classify requests as informational, actionable, or policy-lookup.
2. Grounding: Always ground responses in retrieved data snippets; cite sources when possible.
3. Structured Output: Return JSON with keys:
   - type: "text"|"table"|"chart"|"action"
   - content: markdown or structured data
   - chartSpec: if type=chart, include a simple chart config
   - action: if type=action, include name and payload
4. Clarity & Brevity: Keep answers concise; ask clarifying questions if needed.
5. Security: Respect user permissions; do not expose unauthorized data.

Available context: ${context}

Always respond with valid JSON in the exact format specified above.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Query: ${message}\n\nPlease respond with a JSON object containing type, content, and optionally chartSpec or action fields.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
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
      return parsedResponse;
    } catch (parseError) {
      // Fallback to text response if JSON parsing fails
      return {
        type: 'text',
        content: geminiText
      };
    }
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      type: 'text',
      content: 'I can help you with data queries, insights, and staff operations. What would you like to know about your business data?'
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
