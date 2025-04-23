
import { User } from '@supabase/supabase-js';
import { Court } from './supabase';

export type SessionStatus = 'registered' | 'waitlisted' | 'cancelled';

export type Session = {
  id: string;
  title: string;
  description?: string;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  max_players: number;
  skill_level?: string;
  is_active: boolean;
  created_by: string;
  is_recurring?: boolean;
  recurrence_end_date?: string;
  courts?: {
    name: string;
    type: string;
  };
  current_registrations?: number;
  total_spots?: number;
};

export type SessionRegistration = {
  id: string;
  session_id: string;
  user_id: string;
  status: SessionStatus;
  waitlist_position?: number;
  user?: Pick<User, 'email' | 'id'>;
  session?: Session;
};
