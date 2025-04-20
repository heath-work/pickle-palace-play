
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Membership from "./pages/Membership";
import Booking from "./pages/Booking";
import BookingHistory from "./pages/BookingHistory";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
import ProfilePage from "./pages/auth/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MembershipSuccess from "./pages/MembershipSuccess";
import BookingSuccess from "./pages/BookingSuccess";
import TestMembership from "./pages/TestMembership";

// Create a client
const queryClient = new QueryClient();

// Profile refresher component to handle profile refreshes on route changes
const ProfileRefresher = () => {
  const { user, refreshProfile } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (user) {
      console.log('Refreshing profile data on route change:', location.pathname);
      refreshProfile(user.id);
    }
  }, [location.pathname, user]);
  
  return null;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ProfileRefresher />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/membership-success" element={<MembershipSuccess />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/profile" element={<ProfilePage />} />
        <Route path="/test-membership" element={<TestMembership />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
