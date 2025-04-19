
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    const { type, planId, priceId, email, password, fullName } = await req.json();
    logStep("Request parsed", { type, planId, priceId: priceId ? "***" : null, email: email ? "***" : null });
    
    // Create Supabase client for auth
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let user = null;
    
    // If email and password provided, this is a new signup
    if (email && password) {
      logStep("Attempting to sign up new user", { email: email ? "***" : null });
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });
      
      if (signUpError) {
        logStep("Signup error", { error: signUpError.message });
        throw new Error(`Signup error: ${signUpError.message}`);
      }
      
      user = signUpData.user;
      
      if (!user) {
        logStep("Failed to create user account");
        throw new Error("Failed to create user account");
      }
      logStep("User signed up successfully", { userId: user.id });
    } else {
      // Get user from auth header for existing users
      logStep("Getting existing user from auth header");
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header provided");
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !userData.user) {
        logStep("User auth error", { error: userError?.message });
        throw new Error("User not authenticated");
      }
      
      user = userData.user;
      logStep("Got existing user", { userId: user.id });
    }
    
    // Initialize Stripe
    logStep("Initializing Stripe");
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Check if customer exists already
    logStep("Checking if customer exists", { email: user.email ? "***" : null });
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer
      logStep("Creating new customer");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }
    
    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    let session;
    
    if (type === "membership") {
      logStep("Creating membership checkout", { priceId });
      
      // Define hardcoded Stripe price IDs
      const STRIPE_PRICE_IDS = {
        basic: 'price_0OFJpk086zbpX7xNFOtSJa4v',    // Basic plan
        premium: 'price_0OFJqD086zbpX7xNWYX6S2X0',  // Premium plan
        elite: 'price_0OFJrA086zbpX7xNHGUyRK6i',    // Elite plan
        founder: 'price_0OFJr2086zbpX7xN4l6Ioe2K'   // Founder plan
      };
      
      // Get the correct price ID based on the plan
      const actualPriceId = STRIPE_PRICE_IDS[planId.toLowerCase()] || priceId;
      logStep("Using price ID for checkout", { planId, actualPriceId });
      
      if (!actualPriceId) {
        throw new Error(`No valid price ID found for plan: ${planId}`);
      }
      
      // Create subscription checkout
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{
          price: actualPriceId,
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/membership`,
      });
      logStep("Created subscription checkout session", { sessionId: session.id });
    } else if (type === "booking") {
      // Create one-time payment checkout
      logStep("Creating booking checkout");
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Court Booking",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking`,
      });
      logStep("Created booking checkout session", { sessionId: session.id });
    } else {
      throw new Error("Invalid checkout type");
    }
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
