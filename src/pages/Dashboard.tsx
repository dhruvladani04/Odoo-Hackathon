
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, Star, TrendingUp, Search, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSwaps: 0,
    activeSwaps: 0,
    completedSwaps: 0,
    pendingRequests: 0
  });
  const [recentSwaps, setRecentSwaps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(profileData);

      // Fetch swap statistics
      const { data: swapsData } = await supabase
        .from('swaps')
        .select('*')
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`);

      if (swapsData) {
        setStats({
          totalSwaps: swapsData.length,
          activeSwaps: swapsData.filter(s => s.status === 'accepted').length,
          completedSwaps: swapsData.filter(s => s.status === 'completed').length,
          pendingRequests: swapsData.filter(s => s.provider_id === user.id && s.status === 'pending').length
        });
      }

      // Fetch recent swaps with user details
      const { data: recentSwapsData } = await supabase
        .from('swaps')
        .select(`
          *,
          requester:profiles!swaps_requester_id_fkey(*),
          provider:profiles!swaps_provider_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentSwaps(recentSwapsData || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status as keyof typeof colors] || colors.pending;
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Skill Sharer'}! 🌟
          </h1>
          <p className="text-gray-600">Here's what's happening with your skill swaps today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSwaps}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeSwaps}</div>
              <p className="text-xs text-muted-foreground">Currently ongoing</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.completedSwaps}</div>
              <p className="text-xs text-muted-foreground">Successful swaps</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest skill swap interactions</CardDescription>
                </div>
                <Link to="/swaps">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSwaps.length > 0 ? (
                recentSwaps.map((swap) => {
                  const isRequester = profile?.user_id === swap.requester_id;
                  const otherUser = isRequester ? swap.provider : swap.requester;
                  
                  return (
                    <div key={swap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                          <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{otherUser?.name}</p>
                          <p className="text-xs text-gray-600">
                            {swap.skill_offered} ↔ {swap.skill_wanted}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(swap.status)}>
                        {swap.status}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No swap activity yet.</p>
                  <p className="text-sm">Start by browsing skills or completing your profile!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with skill swapping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/browse" className="w-full">
                <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Skills
                </Button>
              </Link>
              
              <Link to="/profile" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
              
              {stats.pendingRequests > 0 && (
                <Link to="/swaps" className="w-full">
                  <Button variant="outline" className="w-full justify-start border-orange-200 text-orange-600 hover:bg-orange-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Review Requests ({stats.pendingRequests})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Prompt */}
        {!profile?.profile_complete && (
          <Card className="mt-6 border-orange-200 bg-orange-50/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Complete Your Profile</h3>
                <p className="text-orange-700 mb-4">
                  Add your skills and bio to start connecting with other skill-sharers!
                </p>
                <Link to="/profile">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
