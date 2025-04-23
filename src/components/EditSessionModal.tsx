
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Session } from '@/types/sessions';

interface EditSessionModalProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Session>) => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ session, open, onOpenChange, onSave }) => {
  const [form, setForm] = useState({
    title: session.title,
    start_time: session.start_time,
    end_time: session.end_time,
    max_players: session.max_players,
    description: session.description || '',
    skill_level: session.skill_level || '',
  });

  React.useEffect(() => {
    if (open) {
      setForm({
        title: session.title,
        start_time: session.start_time,
        end_time: session.end_time,
        max_players: session.max_players,
        description: session.description || '',
        skill_level: session.skill_level || '',
      });
    }
  }, [session, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
          </div>
          <div>
            <Label>Skill Level</Label>
            <Input value={form.skill_level} onChange={e => setForm(f => ({ ...f, skill_level: e.target.value }))} />
          </div>
          <div>
            <Label>Max Players</Label>
            <Input type="number" value={form.max_players} min={1} onChange={e => setForm(f => ({ ...f, max_players: Number(e.target.value) }))} required />
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSessionModal;
