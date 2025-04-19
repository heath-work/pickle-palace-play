
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://lhlbcclbjzxkxgppmuvp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobGJjY2xianp4a3hncHBtdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NjI4NzMsImV4cCI6MjA2MDMzODg3M30.cuizCUI29QFXhX_CP7J5YmCBFCgRaAAadsHFXRJzemI";
const STRIPE_SECRET_KEY = "sk_test_51RFBFi086zbpX7xNyrvLpj5QDk2fnELRlzMpmYeDBBHw99csoTWv22VbJDoBDgdndukvMErAwmfADiJOYsF5IZm300SilWIQ6H";

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Create Supabase client for auth
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("User authentication error", { error: userError?.message });
      throw new Error("User not authenticated");
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });
    
    // Initialize Stripe
    logStep("Initializing Stripe");
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Find customer
    logStep("Finding Stripe customer", { email: user.email ? "***" : null });
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      throw new Error("No Stripe customer found for this user");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });
    
    // Get origin for return URL
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    // Create customer portal session
    logStep("Creating customer portal session");
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/membership`,
    });
    logStep("Created portal session", { sessionId: session.id });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Customer portal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
