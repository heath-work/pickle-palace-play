
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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const PLAN_MAPPING = {
  "prod_S9VikH2CV6NBRy": "Basic",
  "prod_S9ViDXMS27q5uG": "Premium",
  "prod_S9VhRsmJf38RUc": "Founder"
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
    logStep("Finding Stripe customer", { email: user.email });
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });
    
    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });
    
    if (subscriptions.data.length === 0) {
      logStep("No active subscriptions found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get subscription details
    const subscription = subscriptions.data[0];
    const items = subscription.items.data;
    
    if (items.length === 0) {
      logStep("No items in subscription");
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const product = items[0].price.product;
    logStep("Found product", { productId: product });
    
    // Map product to plan type
    let subscriptionTier = "Premium"; // Default
    
    if (typeof product === 'string') {
      subscriptionTier = PLAN_MAPPING[product] || "Premium";
    }
    
    logStep("Determined subscription tier", { subscriptionTier });
    
    // Update profile in Supabase with membership type
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        membership_type: subscriptionTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (updateError) {
      logStep("Error updating profile", { error: updateError.message });
      console.error("Error updating profile:", updateError);
    } else {
      logStep("Updated profile with membership type");
    }
    
    return new Response(JSON.stringify({
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
