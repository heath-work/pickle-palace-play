import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    court_id: '',
    date: '',
    start_time: '',
    end_time: '',
    max_players: 8,
    skill_level: 'All Levels',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        toast.error('You must be logged in to create a session');
        return;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          ...formData,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Session created successfully');
      setIsOpen(false);
      onSessionCreated(data);

      // Reset form
      setFormData({
        title: '',
        description: '',
        court_id: '',
        date: '',
        start_time: '',
        end_time: '',
        max_players: 8,
        skill_level: 'All Levels',
      });

    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            <div>
              <Label>Max Players</Label>
              <Input 
                type="number" 
                value={formData.max_players}
                onChange={(e) => setFormData({...formData, max_players: Number(e.target.value)})}
                min={2}
                max={20}
                required 
              />
            </div>
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
          
          <Button type="submit" className="w-full">Create Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionModal;
