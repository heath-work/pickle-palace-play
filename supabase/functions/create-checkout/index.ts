
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

// Define product IDs
const STRIPE_PRODUCT_IDS = {
  basic: 'prod_S9VikH2CV6NBRy',
  premium: 'prod_S9ViDXMS27q5uG', // Using Elite product ID for Premium
  elite: 'prod_S9ViDXMS27q5uG',
  founder: 'prod_S9VhRsmJf38RUc'
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Request body parsed", requestBody);
    } catch (error) {
      logStep("Failed to parse request body", { error: error.message });
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Validate request parameters
    const { type, planId, email, password, fullName } = requestBody;
    
    if (!type) {
      logStep("Missing required parameter", { parameter: "type" });
      return new Response(JSON.stringify({ error: "Missing required parameter: type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    if (type === "membership" && !planId) {
      logStep("Missing required parameter", { parameter: "planId" });
      return new Response(JSON.stringify({ error: "Missing required parameter: planId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Special validation for emails when provided
    if (email && !isValidEmail(email)) {
      logStep("Invalid email format", { email: email });
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    logStep("Request params extracted", { 
      type, 
      planId, 
      email: email ? "***" : null,
      passwordProvided: !!password,
      fullNameProvided: !!fullName 
    });
    
    // Create Supabase client for auth
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let user = null;
    
    // If email and password provided, this is a new signup
    if (email && password) {
      logStep("Attempting to sign up new user", { email: email ? "***" : null });
      
      try {
        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        
        if (existingUser && existingUser.user) {
          // User already exists and password matches, continue with this user
          logStep("User already exists and authenticated", { userId: existingUser.user.id });
          user = existingUser.user;
        } else if (checkError && checkError.message.includes("Invalid login credentials")) {
          // User may exist but password is wrong, or user doesn't exist
          // Try to sign up the user
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
            if (signUpError.message === "User already registered") {
              logStep("User exists but with different password", { error: signUpError.message });
              return new Response(JSON.stringify({ 
                error: "This email is already registered with a different password. Please sign in first.",
                code: "USER_EXISTS" 
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 409, // Conflict
              });
            } else {
              logStep("Signup error", { error: signUpError.message });
              return new Response(JSON.stringify({ error: `Signup error: ${signUpError.message}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
              });
            }
          }
          
          user = signUpData.user;
          
          if (!user) {
            logStep("Failed to create user account");
            return new Response(JSON.stringify({ error: "Failed to create user account" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
          }
          logStep("User signed up successfully", { userId: user.id });
        } else {
          // Some other error occurred during sign-in check
          logStep("Error checking existing user", { error: checkError?.message });
          return new Response(JSON.stringify({ error: `Error checking existing user: ${checkError?.message}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      } catch (error) {
        logStep("Unexpected error during signup/signin", { error: error.message });
        return new Response(JSON.stringify({ error: `Unexpected error during authentication: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else {
      // Get user from auth header for existing users
      logStep("Getting existing user from auth header");
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        logStep("No authorization header provided");
        return new Response(JSON.stringify({ error: "No authorization header provided" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (userError || !userData.user) {
          logStep("User auth error", { error: userError?.message });
          return new Response(JSON.stringify({ error: "User not authenticated" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        user = userData.user;
        logStep("Got existing user", { userId: user.id });
      } catch (error) {
        logStep("Error getting user from auth header", { error: error.message });
        return new Response(JSON.stringify({ error: `Error authenticating user: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }
    
    // Initialize Stripe
    logStep("Initializing Stripe");
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Check if customer exists already
    logStep("Checking if customer exists", { email: user.email ? "***" : null });
    let customers;
    try {
      customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
    } catch (error) {
      logStep("Error checking for existing customer", { error: error.message });
      return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer
      logStep("Creating new customer");
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
        logStep("Created new customer", { customerId });
      } catch (error) {
        logStep("Error creating new customer", { error: error.message });
        return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }
    
    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    let session;
    
    if (type === "membership") {
      logStep("Creating membership checkout for plan", { planId });
      
      // Get the correct product ID based on the plan, normalize the plan ID to lowercase
      const planKey = planId.toLowerCase();
      if (!STRIPE_PRODUCT_IDS[planKey]) {
        logStep("Invalid plan ID", { planId, planKey });
        return new Response(JSON.stringify({ error: `Invalid plan ID: ${planId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      const productId = STRIPE_PRODUCT_IDS[planKey];
      logStep("Found product ID for plan", { planId, productId });
      
      // Get all prices for this product
      let prices;
      try {
        prices = await stripe.prices.list({
          product: productId,
          active: true,
        });
      } catch (error) {
        logStep("Error fetching prices", { error: error.message });
        return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      if (prices.data.length === 0) {
        logStep("No prices found for product", { productId });
        return new Response(JSON.stringify({ error: `No prices found for product: ${productId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      // Use the first price found (assuming it's the correct one)
      const price = prices.data[0];
      logStep("Found price for product", { productId, priceId: price.id, price: price.unit_amount });
      
      // Create subscription checkout
      try {
        session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [{
            price: price.id,
            quantity: 1,
          }],
          mode: "subscription",
          success_url: `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/membership`,
        });
        
        logStep("Created subscription checkout session", { sessionId: session.id });
      } catch (error) {
        logStep("Error creating checkout session", { error: error.message });
        return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else if (type === "booking") {
      // Create one-time payment checkout
      logStep("Creating booking checkout");
      try {
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
      } catch (error) {
        logStep("Error creating booking checkout session", { error: error.message });
        return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else {
      logStep("Invalid checkout type", { type });
      return new Response(JSON.stringify({ error: "Invalid checkout type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
