import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Swap {
  id: string;
  skill_offered: string;
  skill_wanted: string;
  message: string;
  status: string;
  created_at: string;
  requester_id: string;
  provider_id: string;
  requester?: any;
  provider?: any;
}

const Swaps = () => {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSwaps();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchSwaps = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('swaps')
        .select(`
          *,
          requester:profiles!swaps_requester_id_fkey(*),
          provider:profiles!swaps_provider_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swaps:', error);
        toast({
          title: "Error",
          description: "Failed to load swaps",
          variant: "destructive"
        });
      } else {
        setSwaps(data || []);
      }
    }
    setLoading(false);
  };

  const updateSwapStatus = async (swapId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('swaps')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', swapId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Swap ${status} successfully!`,
      });

      fetchSwaps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteSwapRequest = async (swapId: string) => {
    try {
      console.log('Attempting to delete swap:', swapId);
      
      const { error } = await supabase
        .from('swaps')
        .delete()
        .eq('id', swapId)
        .eq('requester_id', currentUser?.id); // Extra security check

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Success!",
        description: "Swap request deleted successfully!",
      });

      fetchSwaps();
    } catch (error: any) {
      console.error('Failed to delete swap:', error);
      toast({
        title: "Error",
        description: "Failed to delete swap request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: Star }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filterSwaps = (type: string) => {
    if (!currentUser) return [];
    
    switch (type) {
      case 'incoming':
        return swaps.filter(swap => swap.provider_id === currentUser.id && swap.status === 'pending');
      case 'sent':
        return swaps.filter(swap => swap.requester_id === currentUser.id);
      case 'active':
        return swaps.filter(swap => swap.status === 'accepted');
      case 'completed':
        return swaps.filter(swap => swap.status === 'completed');
      default:
        return swaps;
    }
  };

  const SwapCard = ({ swap }: { swap: Swap }) => {
    const isRequester = currentUser?.id === swap.requester_id;
    const otherUser = isRequester ? swap.provider : swap.requester;
    const canAcceptReject = !isRequester && swap.status === 'pending';
    const canUnsend = isRequester && swap.status === 'pending';

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
                <CardDescription>@{otherUser?.username}</CardDescription>
              </div>
            </div>
            {getStatusBadge(swap.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">
                {isRequester ? 'You offer:' : 'They offer:'}
              </h4>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {swap.skill_offered}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">
                {isRequester ? 'You want:' : 'They want:'}
              </h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {swap.skill_wanted}
              </Badge>
            </div>
          </div>

          {swap.message && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Message:</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {swap.message}
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {canAcceptReject && (
              <>
                <Button
                  onClick={() => updateSwapStatus(swap.id, 'accepted')}
                  className="bg-green-500 hover:bg-green-600"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => updateSwapStatus(swap.id, 'rejected')}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            )}

            {canUnsend && (
              <Button
                onClick={() => deleteSwapRequest(swap.id)}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Unsend
              </Button>
            )}
            
            {swap.status === 'accepted' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/chat/${swap.id}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button
                  onClick={() => updateSwapStatus(swap.id, 'completed')}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Skill Swaps</h1>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="incoming">
              Incoming ({filterSwaps('incoming').length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({filterSwaps('sent').length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({filterSwaps('active').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterSwaps('completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSwaps('incoming').map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
            {filterSwaps('incoming').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No incoming swap requests yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSwaps('sent').map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
            {filterSwaps('sent').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                You haven't sent any swap requests yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSwaps('active').map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
            {filterSwaps('active').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No active swaps yet. Accept some requests to get started!
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterSwaps('completed').map((swap) => (
                <SwapCard key={swap.id} swap={swap} />
              ))}
            </div>
            {filterSwaps('completed').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No completed swaps yet. Finish some active swaps!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Swaps;
