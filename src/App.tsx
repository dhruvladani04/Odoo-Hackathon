
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import Swaps from "./pages/Swaps";
import Chats from "./pages/Chats";
import ChatPage from "./pages/ChatPage";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import AdminGuard from "./components/AdminGuard";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            {user && <Navbar />}
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
              <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
              <Route path="/browse" element={user ? <Browse /> : <Navigate to="/auth" replace />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
              <Route path="/swaps" element={user ? <Swaps /> : <Navigate to="/auth" replace />} />
              <Route path="/chats" element={user ? <Chats /> : <Navigate to="/auth" replace />} />
              <Route path="/chat/:swapId" element={user ? <ChatPage /> : <Navigate to="/auth" replace />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
