
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
  courts?: {
    name: string;
    type: string;
  };
  current_registrations?: number;
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

