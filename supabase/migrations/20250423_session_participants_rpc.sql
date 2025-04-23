
-- Create a function to get all participants for a session
CREATE OR REPLACE FUNCTION public.get_session_participants(p_session_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  username text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.user_id,
    sr.status,
    p.username
  FROM 
    public.session_registrations sr
  LEFT JOIN 
    public.profiles p ON sr.user_id = p.id
  WHERE 
    sr.session_id = p_session_id
    AND sr.status <> 'cancelled';
END;
$$;

-- Create a helper function that can be called from Edge Functions to create the above function
CREATE OR REPLACE FUNCTION public.create_get_session_participants_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE '
    CREATE OR REPLACE FUNCTION public.get_session_participants(p_session_id uuid)
    RETURNS TABLE (
      id uuid,
      user_id uuid,
      status text,
      username text
    ) 
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        sr.id,
        sr.user_id,
        sr.status,
        p.username
      FROM 
        public.session_registrations sr
      LEFT JOIN 
        public.profiles p ON sr.user_id = p.id
      WHERE 
        sr.session_id = p_session_id
        AND sr.status <> ''cancelled'';
    END;
    $func$;
  ';
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_session_participants TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_get_session_participants_function TO service_role;
