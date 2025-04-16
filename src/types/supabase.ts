
export type Court = {
  id: number;
  name: string;
  type: string;
  description?: string;
  created_at?: string;
};

export type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
  created_at?: string;
};

export type Booking = {
  id: string;
  user_id: string;
  court_id: number;
  court_name?: string;
  court_type?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  partners?: string[];
  is_coaching_session?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};
