import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProviderProfile from "./pages/ProviderProfile";
import ProvidersList from "./pages/ProvidersList";
import ProviderDetails from "./pages/ProviderDetails";
import NotFound from "./pages/NotFound";
import CreateRequest from "@/pages/CreateRequest";
import MyRequests from "@/pages/MyRequests";
import AllRequests from "@/pages/AllRequests";
import AllPitches from "@/pages/AllPitches";
import RequestPitches from "@/pages/RequestPitches";
import OngoingRequests from "@/pages/OngoingRequests";
import OngoingWork from "@/pages/OngoingWork";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Refetch every 5 seconds
      refetchIntervalInBackground: true, // Continue refetching even when tab is not active
      staleTime: 0, // Consider data stale immediately
      retry: 1, // Only retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/provider/profile" element={
              <ProtectedRoute requiredRole="PROVIDER">
                <ProviderProfile />
              </ProtectedRoute>
            } />
            <Route path="/providers" element={
              <ProtectedRoute>
                <ProvidersList />
              </ProtectedRoute>
            } />
            <Route path="/providers/:providerId" element={
              <ProtectedRoute>
                <ProviderDetails />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            } />
            <Route path="/requests/:requestId/pitches" element={
              <ProtectedRoute>
                <RequestPitches />
              </ProtectedRoute>
            } />
            <Route path="/all-requests" element={
              <ProtectedRoute>
                <AllRequests />
              </ProtectedRoute>
            } />
            <Route path="/create-request" element={
              <ProtectedRoute requiredRole="CLIENT">
                <CreateRequest />
              </ProtectedRoute>
            } />
            <Route path="/all-pitches" element={
              <ProtectedRoute requiredRole="PROVIDER">
                <AllPitches />
              </ProtectedRoute>
            } />
            <Route path="/ongoing-requests" element={
              <ProtectedRoute requiredRole="CLIENT">
                <OngoingRequests />
              </ProtectedRoute>
            } />
            <Route path="/ongoing-work" element={
              <ProtectedRoute requiredRole="PROVIDER">
                <OngoingWork />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
