
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, planId, priceId, email, password, fullName } = await req.json();
    
    // Create Supabase client for auth
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let user = null;
    
    // If email and password provided, this is a new signup
    if (email && password) {
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
        throw new Error(`Signup error: ${signUpError.message}`);
      }
      
      user = signUpData.user;
      
      if (!user) {
        throw new Error("Failed to create user account");
      }
    } else {
      // Get user from auth header for existing users
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header provided");
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }
      
      user = userData.user;
    }
    
    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Check if customer exists already
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }
    
    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    let session;
    
    if (type === "membership") {
      // Create subscription checkout
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{
          price: priceId, // Use the priceId from the request
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${origin}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/membership`,
      });
    } else if (type === "booking") {
      // Create one-time payment checkout
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
