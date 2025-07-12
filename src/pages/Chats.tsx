
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ChatData {
  swap_id: string;
  skill_offered: string;
  skill_wanted: string;
  status: string;
  other_user: {
    name: string;
    username: string;
    avatar: string;
  };
  last_message?: string;
  last_message_time?: string;
}

const Chats = () => {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchChats();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchChats = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get all accepted swaps for the current user
      const { data: swaps, error } = await supabase
        .from('swaps')
        .select(`
          id,
          skill_offered,
          skill_wanted,
          status,
          requester_id,
          provider_id,
          requester:profiles!swaps_requester_id_fkey(*),
          provider:profiles!swaps_provider_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive"
        });
      } else {
        // Transform data to include the other user's info
        const chatsData: ChatData[] = (swaps || []).map(swap => {
          const isRequester = swap.requester_id === user.id;
          const otherUser = isRequester ? swap.provider : swap.requester;
          
          return {
            swap_id: swap.id,
            skill_offered: swap.skill_offered,
            skill_wanted: swap.skill_wanted,
            status: swap.status,
            other_user: {
              name: otherUser?.name || 'Unknown',
              username: otherUser?.username || 'unknown',
              avatar: otherUser?.avatar || ''
            }
          };
        });
        
        setChats(chatsData);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Chats</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <Card 
              key={chat.swap_id} 
              className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate(`/chat/${chat.swap_id}`)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.other_user.avatar} alt={chat.other_user.name} />
                    <AvatarFallback>{chat.other_user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{chat.other_user.name}</CardTitle>
                    <CardDescription>@{chat.other_user.username}</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {chat.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                      Teaching: {chat.skill_offered}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Learning: {chat.skill_wanted}
                    </Badge>
                  </div>
                </div>

                <div className="w-full p-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Open Chat
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {chats.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg">No active chats yet</div>
            <p className="text-gray-400 mt-2">Start chatting once your swap requests are accepted!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
