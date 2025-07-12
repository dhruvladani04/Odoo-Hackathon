import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, ArrowRightLeft, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalSwaps: number;
  totalMessages: number;
  activeSwaps: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  swap_count: number;
}

interface Swap {
  id: string;
  skill_offered: string;
  skill_wanted: string;
  status: string;
  created_at: string;
  requester: {
    name: string;
    email: string;
  };
  provider: {
    name: string;
    email: string;
  };
}

const Admin = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSwaps: 0,
    totalMessages: 0,
    activeSwaps: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel",
    });
    navigate('/admin/auth');
  };

  const loadAdminData = async () => {
    try {
      // Load stats
      const [usersRes, swapsRes, messagesRes, activeSwapsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('swaps').select('id', { count: 'exact' }),
        supabase.from('chat_messages').select('id', { count: 'exact' }),
        supabase.from('swaps').select('id', { count: 'exact' }).neq('status', 'completed')
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalSwaps: swapsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        activeSwaps: activeSwapsRes.count || 0
      });

      // Load users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, name, email, created_at, is_admin, swap_count')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }

      // Load swaps
      const { data: swapsData } = await supabase
        .from('swaps')
        .select(`
          id,
          skill_offered,
          skill_wanted,
          status,
          created_at,
          requester:profiles!swaps_requester_id_fkey(name, email),
          provider:profiles!swaps_provider_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (swapsData) {
        setSwaps(swapsData);
      }
    } catch (error) {
      toast({
        title: "Error loading admin data",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));

      toast({
        title: "Admin status updated",
        description: `User ${!currentStatus ? 'promoted to' : 'removed from'} admin`,
      });
    } catch (error) {
      toast({
        title: "Error updating admin status",
        description: "Failed to update user admin status",
        variant: "destructive",
      });
    }
  };

  const updateSwapStatus = async (swapId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('swaps')
        .update({ status: newStatus })
        .eq('id', swapId);

      if (error) throw error;

      setSwaps(swaps.map(swap => 
        swap.id === swapId ? { ...swap, status: newStatus } : swap
      ));

      toast({
        title: "Swap status updated",
        description: `Swap status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating swap status",
        description: "Failed to update swap status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-red-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSwaps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSwaps}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="swaps">Swap Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and admin permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{user.name || 'No name'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          {user.is_admin && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Joined: {new Date(user.created_at).toLocaleDateString()} • 
                          Swaps: {user.swap_count || 0}
                        </p>
                      </div>
                      <Button
                        variant={user.is_admin ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps">
            <Card>
              <CardHeader>
                <CardTitle>Swap Management</CardTitle>
                <CardDescription>
                  Monitor and manage skill swaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{swap.skill_offered} ↔ {swap.skill_wanted}</p>
                            <p className="text-sm text-muted-foreground">
                              {swap.requester?.name} → {swap.provider?.name}
                            </p>
                          </div>
                          <Badge 
                            variant={swap.status === 'accepted' ? 'default' : swap.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {swap.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created: {new Date(swap.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {swap.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateSwapStatus(swap.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateSwapStatus(swap.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {swap.status === 'accepted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateSwapStatus(swap.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {swaps.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No swaps found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;