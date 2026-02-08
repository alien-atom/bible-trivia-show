import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Country {
  id: string;
  name: string;
  code: string;
  territoryId: string;
  flagEmoji: string | null;
}

interface Territory {
  id: string;
  name: string;
  region: string;
  emblemColor: string;
}

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: { id: string; email: string; name?: string | null; displayName?: string | null; countryId?: string | null } | null;
}

export function ProfileSettings({ open, onOpenChange, currentUser }: ProfileSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.name || '');
  const [countryId, setCountryId] = useState(currentUser?.countryId || '');

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setUsername(currentUser.name || '');
      setCountryId(currentUser.countryId || '');
    }
  }, [currentUser]);

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetch('/api/countries');
      if (!res.ok) throw new Error('Failed to fetch countries');
      return res.json();
    }
  });

  const { data: territories = [] } = useQuery<Territory[]>({
    queryKey: ['territories'],
    queryFn: async () => {
      const res = await fetch('/api/territories');
      if (!res.ok) throw new Error('Failed to fetch territories');
      return res.json();
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { displayName?: string; name?: string; countryId?: string }) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: 'Profile Updated',
        description: 'Your settings have been saved successfully.'
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    updateProfile.mutate({
      displayName: displayName || undefined,
      name: username || undefined,
      countryId: countryId || undefined
    });
  };

  const groupedCountries = countries.reduce((acc, country) => {
    const territory = territories.find(t => t.id === country.territoryId);
    const regionName = territory?.name || 'Other';
    if (!acc[regionName]) acc[regionName] = [];
    acc[regionName].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Customize your profile and select your country to compete with players from your region.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              data-testid="input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Your unique username for the app
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              data-testid="input-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              This is how you'll appear on the leaderboard
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Country
            </Label>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger className="rounded-xl" data-testid="select-country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedCountries).map(([region, regionCountries]) => (
                  <div key={region}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/50 sticky top-0">
                      {region}
                    </div>
                    {regionCountries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flagEmoji || '🏳️'}</span>
                          {country.name}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Compete against other players from your country and territory
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateProfile.isPending}
            className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600"
            data-testid="button-save-profile"
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
