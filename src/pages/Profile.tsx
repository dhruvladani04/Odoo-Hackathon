
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Edit3, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    skills_offered: [] as string[],
    skills_wanted: [] as string[],
    availability: 'weekends',
    is_public: true
  });
  const [newSkill, setNewSkill] = useState({ offered: '', wanted: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          skills_offered: data.skills_offered || [],
          skills_wanted: data.skills_wanted || [],
          availability: data.availability || 'weekends',
          is_public: data.is_public ?? true
        });
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await createProfile(user);
      }
    }
    setLoading(false);
  };

  const createProfile = async (user: any) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || '',
        profile_complete: false
      });

    if (!error) {
      fetchProfile();
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully!",
      });

      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const skill = type === 'offered' ? newSkill.offered : newSkill.wanted;
    if (!skill.trim()) return;

    const skillKey = type === 'offered' ? 'skills_offered' : 'skills_wanted';
    const currentSkills = formData[skillKey];
    
    if (!currentSkills.includes(skill.trim())) {
      setFormData({
        ...formData,
        [skillKey]: [...currentSkills, skill.trim()]
      });
    }

    setNewSkill({
      ...newSkill,
      [type]: ''
    });
  };

  const removeSkill = (type: 'offered' | 'wanted', skillToRemove: string) => {
    const skillKey = type === 'offered' ? 'skills_offered' : 'skills_wanted';
    setFormData({
      ...formData,
      [skillKey]: formData[skillKey].filter(skill => skill !== skillToRemove)
    });
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile?.avatar} alt={profile?.name} />
                <AvatarFallback className="text-2xl">
                  {profile?.name?.charAt(0) || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="@username"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle>{profile?.name || 'Add your name'}</CardTitle>
                  <CardDescription>@{profile?.username}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-toggle">Public Profile</Label>
                <Switch
                  id="public-toggle"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
                  disabled={!editing}
                />
              </div>
              
              {editing && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills & Details */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle>Skills & Interests</CardTitle>
              <CardDescription>
                Manage what you can teach and what you'd like to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="offered" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="offered" className="text-green-700">Skills I Offer</TabsTrigger>
                  <TabsTrigger value="wanted" className="text-blue-700">Skills I Want</TabsTrigger>
                </TabsList>
                
                <TabsContent value="offered" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_offered.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 gap-2">
                        {skill}
                        {editing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => removeSkill('offered', skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill you can teach..."
                        value={newSkill.offered}
                        onChange={(e) => setNewSkill({...newSkill, offered: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                      />
                      <Button onClick={() => addSkill('offered')} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="wanted" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_wanted.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 gap-2">
                        {skill}
                        {editing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => removeSkill('wanted', skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill you want to learn..."
                        value={newSkill.wanted}
                        onChange={(e) => setNewSkill({...newSkill, wanted: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                      />
                      <Button onClick={() => addSkill('wanted')} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {!profile?.profile_complete && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Complete Your Profile</h3>
                <p className="text-orange-700 mb-4">
                  Add your skills and bio to start connecting with other skill-sharers!
                </p>
                <Button 
                  onClick={() => setEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
