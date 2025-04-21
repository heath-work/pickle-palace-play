
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

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-BOOKING-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Request body parsed", { 
        sessionId: requestBody.sessionId,
        userIdProvided: !!requestBody.userId 
      });
    } catch (error) {
      logStep("Failed to parse request body", { error: error.message });
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const { sessionId, userId } = requestBody;
    
    if (!sessionId) {
      logStep("Missing required parameter", { parameter: "sessionId" });
      return new Response(JSON.stringify({ error: "Missing required parameter: sessionId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Validate the user is authenticated
    let user;
    try {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const authHeader = req.headers.get("Authorization");
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (userError) {
          logStep("Error authenticating user", { error: userError.message });
        } else if (userData?.user) {
          user = userData.user;
          logStep("User authenticated", { userId: user.id });
        }
      }
      
      // If no authenticated user, check the provided userId
      if (!user && userId) {
        logStep("Using provided userId for verification", { userId });
        user = { id: userId };
      }
      
      if (!user) {
        logStep("No authenticated user or userId provided");
        return new Response(JSON.stringify({ error: "User not authenticated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    } catch (error) {
      logStep("Error during authentication check", { error: error.message });
      return new Response(JSON.stringify({ error: "Authentication error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Initialize Stripe to verify session
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    
    // Retrieve the Stripe session
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      logStep("Retrieved Stripe session", { 
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        hasMetadata: !!session.metadata
      });
      
      if (session.status !== 'complete' || session.payment_status !== 'paid') {
        logStep("Session not completed or payment not made", { 
          status: session.status, 
          paymentStatus: session.payment_status 
        });
        return new Response(JSON.stringify({ 
          error: "Payment not completed",
          status: session.status,
          paymentStatus: session.payment_status  
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      // Verify the payment is for a booking
      if (!session.metadata || !session.metadata.court_id || !session.metadata.booking_date) {
        logStep("Missing booking metadata in session");
        return new Response(JSON.stringify({ error: "Invalid booking session" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      // Verify the user ID matches
      if (session.metadata.user_id !== user.id) {
        logStep("User ID mismatch", { 
          sessionUserId: session.metadata.user_id, 
          requestUserId: user.id 
        });
        return new Response(JSON.stringify({ error: "User ID mismatch" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
    } catch (error) {
      logStep("Error retrieving Stripe session", { error: error.message });
      return new Response(JSON.stringify({ error: `Stripe error: ${error.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Extract booking details from session metadata
    const bookingData = {
      user_id: session.metadata.user_id,
      court_id: parseInt(session.metadata.court_id),
      booking_date: session.metadata.booking_date,
      time_slot_id: parseInt(session.metadata.time_slot_id),
      duration_hours: parseInt(session.metadata.duration_hours || '1')
    };
    
    logStep("Extracted booking data from session", bookingData);
    
    // Get time slot info
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: timeSlotData, error: timeSlotError } = await supabaseClient
      .from('time_slots')
      .select('start_time, end_time')
      .eq('id', bookingData.time_slot_id)
      .single();
      
    if (timeSlotError) {
      logStep("Error fetching time slot data", { error: timeSlotError.message });
      return new Response(JSON.stringify({ error: `Error fetching time slot: ${timeSlotError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Calculate end time based on duration
    const startTime = timeSlotData.start_time;
    // Parse hours and minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    // Add duration to hours
    const endHours = startHours + bookingData.duration_hours;
    // Format end time
    const endTime = `${endHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;
    
    logStep("Calculated booking times", { 
      startTime, 
      endTime, 
      durationHours: bookingData.duration_hours 
    });
    
    // Create the booking in Supabase
    try {
      const { data: booking, error: bookingError } = await supabaseClient
        .from('bookings')
        .insert({
          user_id: bookingData.user_id,
          court_id: bookingData.court_id,
          booking_date: bookingData.booking_date,
          start_time: startTime,
          end_time: endTime,
          duration_hours: bookingData.duration_hours,
          notes: `Paid via Stripe. Session ID: ${sessionId}`
        })
        .select()
        .single();
        
      if (bookingError) {
        logStep("Error creating booking in database", { error: bookingError.message });
        return new Response(JSON.stringify({ error: `Error creating booking: ${bookingError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      logStep("Booking created successfully", { bookingId: booking.id });
      
      // Get additional booking details for the response
      const { data: courtData } = await supabaseClient
        .from('courts')
        .select('name')
        .eq('id', bookingData.court_id)
        .single();
        
      const bookingDetails = {
        ...booking,
        court_name: courtData?.name || 'Court',
        start_time_formatted: startTime.substring(0, 5),
        date_formatted: new Date(bookingData.booking_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      
      return new Response(JSON.stringify({ 
        success: true,
        booking: bookingDetails
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      logStep("Unexpected error creating booking", { error: error.message });
      return new Response(JSON.stringify({ error: `Unexpected error: ${error.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-booking-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
