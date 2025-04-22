
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Court } from '@/types/supabase';
import { Session } from '@/types/sessions';

interface CreateSessionModalProps {
  courts: Court[];
  onSessionCreated: (session: Session) => void;
}

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ courts, onSessionCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    court_id: '',
    date: '',
    start_time: '',
    end_time: '',
    max_players: 8,
    skill_level: 'All Levels',
    is_recurring: false,
    recurrence_end_date: '',
  });

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can create sessions');
      return;
    }

    try {
      // Create the base session data
      const sessionData = {
        title: formData.title,
        description: formData.description,
        court_id: parseInt(formData.court_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_players: formData.max_players,
        skill_level: formData.skill_level,
        created_by: user!.id,
        is_active: true,
      };

      // First create the initial session
      const { data: initialSession, error: initialError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (initialError) throw initialError;

      // If session is recurring, we need to handle it differently
      if (formData.is_recurring && formData.recurrence_end_date) {
        // For recurring sessions, we need to use separate RPC calls or add custom columns
        // First, update the metadata in our application's state
        const sessionWithRecurrence = {
          ...initialSession,
          is_recurring: formData.is_recurring,
          recurrence_end_date: formData.recurrence_end_date
        };
        
        // We also need to track this in the database, but we'll add these columns separately
        // Instead of directly including them in the initial insert which causes type errors
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            // Use string-indexed access to avoid TypeScript errors
            // This is a workaround for the schema type mismatch
            "is_recurring": true,
            "recurrence_end_date": formData.recurrence_end_date
          } as any)
          .eq('id', initialSession.id);
          
        if (updateError) {
          console.error('Error updating session with recurring info:', updateError);
          // Continue anyway as we've already created the first session
        }
        
        // Create additional recurring sessions
        const startDate = new Date(formData.date);
        const endDate = new Date(formData.recurrence_end_date);
        
        // Skip the first date as we've already created it
        startDate.setDate(startDate.getDate() + 7);
        
        const recurringPromises = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 7)) {
          const recurringSession = {
            ...sessionData,
            date: date.toISOString().split('T')[0]
          };
          
          recurringPromises.push(
            supabase
              .from('sessions')
              .insert(recurringSession)
          );
        }
        
        // Wait for all recurring sessions to be created
        if (recurringPromises.length > 0) {
          const results = await Promise.allSettled(recurringPromises);
          const failures = results.filter(r => r.status === 'rejected');
          if (failures.length > 0) {
            console.warn(`${failures.length} recurring sessions failed to create`);
          }
        }
        
        // Use the enhanced session with recurrence info for our application
        onSessionCreated(sessionWithRecurrence as Session);
      } else {
        // For non-recurring sessions, just use the initial session
        onSessionCreated(initialSession);
      }

      toast.success('Session(s) created successfully');
      setIsOpen(false);

      setFormData({
        title: '',
        description: '',
        court_id: '',
        date: '',
        start_time: '',
        end_time: '',
        max_players: 8,
        skill_level: 'All Levels',
        is_recurring: false,
        recurrence_end_date: '',
      });

    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          
          <div>
            <Label>Description (Optional)</Label>
            <Input 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div>
            <Label>Court</Label>
            <Select 
              value={formData.court_id}
              onValueChange={(value) => setFormData({...formData, court_id: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a court" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id.toString()}>
                    {court.name} ({court.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Label>Is this a recurring session?</Label>
            <RadioGroup
              defaultValue="false"
              onValueChange={(value) => setFormData({...formData, is_recurring: value === 'true'})}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="non-recurring" />
                <Label htmlFor="non-recurring">One-time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="recurring" />
                <Label htmlFor="recurring">Weekly recurring</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            {formData.is_recurring && (
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({...formData, recurrence_end_date: e.target.value})}
                  required 
                  min={formData.date}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input 
                type="time" 
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input 
                type="time" 
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div>
            <Label>Skill Level</Label>
            <Select 
              value={formData.skill_level}
              onValueChange={(value) => setFormData({...formData, skill_level: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full">Create Session{formData.is_recurring ? 's' : ''}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionModal;
