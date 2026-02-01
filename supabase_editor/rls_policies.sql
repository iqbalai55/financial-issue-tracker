-- Profiles: user bisa lihat profile sendiri
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
USING (auth.uid() = id);

-- Issues RLS
CREATE POLICY "Karyawan create" ON issues FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Karyawan own issues" ON issues FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Bendahara all issues" ON issues FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role = 'bendahara'
));

CREATE POLICY "Bendahara update" ON issues FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'bendahara')
  AND status = 'pending'
) TARGET ROWS MODIFIED (status IS DISTINCT FROM OLD.status);

CREATE POLICY "Karyawan complete" ON issues FOR UPDATE 
USING (
  auth.uid() = user_id AND status = 'accepted'
) TARGET ROWS MODIFIED (status IS DISTINCT FROM OLD.status);
