-- ======================================
-- PROFILES TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('karyawan','bendahara')) DEFAULT 'karyawan',
  email TEXT,
  name TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger untuk otomatis insert profile saat user dibuat di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, name)
  VALUES (NEW.id, 'karyawan', NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ======================================
-- ISSUES TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,                       -- kolom baru title
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hapus foreign key duplikat jika sebelumnya ada
ALTER TABLE IF EXISTS issues
DROP CONSTRAINT IF EXISTS issues_user_profile_fkey;

-- Tambahkan FK yang benar
ALTER TABLE IF EXISTS issues
ADD CONSTRAINT issues_user_profile_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- ======================================
-- ENABLE ROW LEVEL SECURITY
-- ======================================
ALTER TABLE IF EXISTS issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- ======================================
-- OPTIONAL: contoh policy supaya user bisa baca sendiri
-- ======================================
-- Supabase example: user dapat baca issue miliknya sendiri
-- CREATE POLICY "Users can read their own issues" ON issues
-- FOR SELECT USING (auth.uid() = user_id);
