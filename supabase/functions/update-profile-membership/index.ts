
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-PROFILE-MEMBERSHIP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables missing");
    }
    
    // Parse request body to get userId and membership type
    const { userId, membershipType } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    logStep("Updating profile membership", { userId, membershipType });
    
    // Create supabase client with service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    
    // Update the user's profile with the new membership type
    const { data, error } = await supabase
      .from('profiles')
      .update({ membership_type: membershipType })
      .eq('id', userId)
      .select();
    
    if (error) {
      logStep("Error updating profile", { error: error.message });
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    
    logStep("Profile updated successfully", { data });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Profile membership updated successfully",
      data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
