import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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


const queryClient = new QueryClient();

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/providers" element={<ProvidersList />} />
            <Route path="/providers/:providerId" element={<ProviderDetails />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/requests/:requestId/pitches" element={<RequestPitches />} />
            <Route path="/all-requests" element={<AllRequests />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/all-pitches" element={<AllPitches />} />
            <Route path="/ongoing-requests" element={<OngoingRequests />} />
            <Route path="/ongoing-work" element={<OngoingWork />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
