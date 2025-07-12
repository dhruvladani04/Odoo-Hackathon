import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Star, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  avatar: string;
  skills_offered: string[];
  skills_wanted: string[];
  rating: number;
  swap_count: number;
}

const Browse = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [swapRequest, setSwapRequest] = useState({
    skillOffered: '',
    skillWanted: '',
    message: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .eq('profile_complete', true)
      .neq('user_id', user?.id); // Filter out current user's profile

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(searchLower) ||
      profile.bio?.toLowerCase().includes(searchLower) ||
      profile.skills_offered?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      profile.skills_wanted?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  const handleSwapRequest = async (profile: Profile) => {
    if (!currentUser) {
      toast({ title: "Error", description: "Please sign in to send swap requests", variant: "destructive" });
      return;
    }

    if (!swapRequest.skillOffered || !swapRequest.skillWanted) {
      toast({ title: "Error", description: "Please select skills to offer and want", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('swaps')
        .insert({
          requester_id: currentUser.id,
          provider_id: profile.user_id,
          skill_offered: swapRequest.skillOffered,
          skill_wanted: swapRequest.skillWanted,
          message: swapRequest.message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Swap request sent successfully!",
      });

      setSwapRequest({ skillOffered: '', skillWanted: '', message: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Skills</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by name, skills, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 hover:scale-[1.02]">
              <CardHeader className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  {profile.location && (
                    <>
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </>
                  )}
                </CardDescription>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{profile.rating || 5.0}</span>
                  <span className="text-sm text-gray-500">({profile.swap_count || 0} swaps)</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                )}
                
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Offers:</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills_offered?.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills_offered?.length > 3 && (
                      <Badge variant="outline">+{profile.skills_offered.length - 3}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Wants:</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills_wanted?.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills_wanted?.length > 3 && (
                      <Badge variant="outline">+{profile.skills_wanted.length - 3}</Badge>
                    )}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Send className="h-4 w-4 mr-2" />
                      Request Swap
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Skill Swap with {profile.name}</DialogTitle>
                      <DialogDescription>
                        Choose which skill you'll offer and which you'd like to learn.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="skill-offered">I can teach:</Label>
                        <Input
                          id="skill-offered"
                          placeholder="e.g., Guitar, Web Development, Cooking"
                          value={swapRequest.skillOffered}
                          onChange={(e) => setSwapRequest({...swapRequest, skillOffered: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="skill-wanted">I want to learn:</Label>
                        <Input
                          id="skill-wanted"
                          placeholder="e.g., Photography, Spanish, Painting"
                          value={swapRequest.skillWanted}
                          onChange={(e) => setSwapRequest({...swapRequest, skillWanted: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message (optional):</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell them why you're interested in this swap..."
                          value={swapRequest.message}
                          onChange={(e) => setSwapRequest({...swapRequest, message: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={() => handleSwapRequest(profile)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No profiles found matching your search.</div>
            <p className="text-gray-400 mt-2">Try adjusting your search terms or browse all skills.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
