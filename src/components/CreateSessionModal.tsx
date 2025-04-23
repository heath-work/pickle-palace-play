
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
import { CourtMultiSelect } from './CourtMultiSelect';

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
    court_ids: [] as string[],
    date: '',
    start_time: '',
    end_time: '',
    skill_level: 'All Levels',
    is_recurring: false,
    recurrence_end_date: '',
  });

  const max_players = Math.max(4, (formData.court_ids.length || 1) * 4);

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
      // Create single session with all courts
      const sessionData = {
        title: formData.title,
        description: formData.description,
        court_id: parseInt(formData.court_ids[0]), // We'll store the primary court here
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_players: max_players, // Total max players across all courts
        skill_level: formData.skill_level,
        created_by: user!.id,
        is_active: true,
      };

      const { data: initialSession, error: initialError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (initialError) throw initialError;

      // If we have multiple courts, add them to the metadata or another method to track them
      if (formData.court_ids.length > 1) {
        console.log(`Session created with multiple courts: ${formData.court_ids.join(', ')}`);
        // Here we could store court relationships if needed in the future
      }

      if (formData.is_recurring && formData.recurrence_end_date) {
        const startDate = new Date(formData.date);
        const endDate = new Date(formData.recurrence_end_date);

        const recurringSessions = [];
        let nextDate = new Date(startDate.getTime());
        nextDate.setDate(nextDate.getDate() + 7);

        while (nextDate <= endDate) {
          recurringSessions.push({
            title: formData.title,
            description: formData.description,
            court_id: parseInt(formData.court_ids[0]),
            date: nextDate.toISOString().split('T')[0],
            start_time: formData.start_time,
            end_time: formData.end_time,
            max_players: max_players,
            skill_level: formData.skill_level,
            created_by: user!.id,
            is_active: true,
          });
          nextDate.setDate(nextDate.getDate() + 7);
        }

        if (recurringSessions.length > 0) {
          const { error: recurringError } = await supabase
            .from('sessions')
            .insert(recurringSessions);

          if (recurringError) {
            console.warn('Some recurring sessions failed:', recurringError);
          }
        }
      }

      toast.success('Session(s) created successfully');
      setIsOpen(false);

      setFormData({
        title: '',
        description: '',
        court_ids: [],
        date: '',
        start_time: '',
        end_time: '',
        skill_level: 'All Levels',
        is_recurring: false,
        recurrence_end_date: '',
      });

      if (initialSession) {
        onSessionCreated(initialSession);
      }
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required 
            />
          </div>
          <div>
            <Label>Description (Optional)</Label>
            <Input 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Courts (Multi-select)</Label>
            <CourtMultiSelect
              label="Courts (Multi-select)"
              options={courts}
              value={formData.court_ids}
              onChange={court_ids => setFormData({ ...formData, court_ids })}
              placeholder="Select court(s)"
            />
          </div>
          <div className="space-y-4">
            <Label>Is this a recurring session?</Label>
            <RadioGroup
              defaultValue="false"
              onValueChange={(value) => setFormData({ ...formData, is_recurring: value === 'true' })}
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
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required 
              />
            </div>
            {formData.is_recurring && (
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required 
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input 
                type="time" 
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required 
              />
            </div>
          </div>
          <div>
            <Label>Skill Level</Label>
            <Select 
              value={formData.skill_level}
              onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
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
          <div>
            <Label>Max Players</Label>
            <Input 
              type="number"
              readOnly
              value={max_players}
              className="bg-gray-100"
            />
            <span className="text-xs text-gray-500">Auto-calculated: 4 per court selected</span>
          </div>
          <Button type="submit" className="w-full">Create Session{formData.is_recurring ? 's' : ''}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionModal;
