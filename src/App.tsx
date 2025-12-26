import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FAQ from "./pages/FAQ";
import Whitepaper from "./pages/Whitepaper";
import Membership from "./pages/Membership";
import Staking from "./pages/Staking";
import Dashboard from "./pages/Dashboard";
import CreateMarket from "./pages/CreateMarket";
import MarketDetails from "./pages/MarketDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/create" element={<CreateMarket />} />
          <Route path="/app/market/:id" element={<MarketDetails />} />
          <Route path="/app/staking" element={<Staking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
