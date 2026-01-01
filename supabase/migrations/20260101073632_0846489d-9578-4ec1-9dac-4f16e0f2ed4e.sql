-- Fix user_roles RLS: allow all authenticated users to view their own role
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

CREATE POLICY "Users can view own role or admins can view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles for role management
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));