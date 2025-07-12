
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Chat from '@/components/Chat';

interface SwapData {
  id: string;
  skill_offered: string;
  skill_wanted: string;
  status: string;
  requester_id: string;
  provider_id: string;
  requester?: any;
  provider?: any;
}

const ChatPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const [swap, setSwap] = useState<SwapData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    if (swapId) {
      fetchSwap();
    }
  }, [swapId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchSwap = async () => {
    if (!swapId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('swaps')
      .select(`
        *,
        requester:profiles!swaps_requester_id_fkey(*),
        provider:profiles!swaps_provider_id_fkey(*)
      `)
      .eq('id', swapId)
      .single();

    if (error) {
      console.error('Error fetching swap:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive"
      });
      navigate('/chats');
    } else {
      setSwap(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat not found</h1>
          <Button onClick={() => navigate('/chats')}>Back to Chats</Button>
        </div>
      </div>
    );
  }

  const isRequester = currentUser?.id === swap.requester_id;
  const otherUser = isRequester ? swap.provider : swap.requester;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chats
          </Button>
        </div>

        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
              <AvatarFallback className="text-lg">
                {otherUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Chat with {otherUser?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Skill Swap: {swap.skill_offered} ↔ {swap.skill_wanted}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border overflow-hidden">
          <Chat swapId={swap.id} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
