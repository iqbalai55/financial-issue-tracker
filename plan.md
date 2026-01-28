# Issue Management MVP - Next.js + Supabase
## Minimal Viable Product untuk pengelolaan issue uang karyawan

**Tanggal Planning:** 28 Januari 2026  
**Tech Stack:** Next.js 15 (App Router) + Supabase (Auth, Postgres, Storage)  
**Estimated Time:** 1-2 minggu solo development  

---

## 🎯 Business Flow
```
1. Karyawan → Buat issue (jumlah + alasan)
2. Bendahara → Review → Accept/Reject 
3. Karyawan → Belanja → Scan struk → Upload → Complete
4. Dashboard → Stats per status
```

## 📋 Status Issue
- `pending` - Menunggu review
- `accepted` - Issue di-approve (uang cair)
- `rejected` - Ditolak
- `completed` - Struk sudah di-upload

---

## 🗄️ Database Schema (Supabase Postgres)

```sql
-- Table utama issues
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
```

### Profiles Table (untuk role)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('karyawan','bendahara')) DEFAULT 'karyawan'
);
```

---

## 🔒 RLS Security Policies (Copy-paste ke Supabase SQL Editor)

```sql
-- 1. Karyawan bisa buat issue
CREATE POLICY "Karyawan create" ON issues FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Karyawan lihat issue sendiri  
CREATE POLICY "Karyawan own issues" ON issues FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Bendahara lihat SEMUA issue
CREATE POLICY "Bendahara all issues" ON issues FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'bendahara'
));

-- 4. Bendahara ubah status (hanya pending → accepted/rejected)
CREATE POLICY "Bendahara update" ON issues FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'bendahara')
) AND status = 'pending'
TARGET ROWS MODIFIED (status IS DISTINCT FROM OLD.status);

-- 5. Karyawan complete issue sendiri (accepted → completed)
CREATE POLICY "Karyawan complete" ON issues FOR UPDATE 
USING (
  auth.uid() = user_id AND status = 'accepted'
) TARGET ROWS MODIFIED (status IS DISTINCT FROM OLD.status);
```

---

## 📱 Pages & Routes

```
app/
├── login/page.tsx           # Login form (Supabase Auth)
├── issues/
│   ├── new/page.tsx         # Karyawan: Buat issue
│   └── page.tsx            # List issue (role-based)
├── issues/[id]/page.tsx    # Detail + scan struk
├── dashboard/
│   ├── page.tsx            # Bendahara: Stats overview
│   └── status/page.tsx     # Bendahara: Kategori per status
└── middleware.ts           # Auth protection
```

### Bendahara Status Page (`/dashboard/status`)
```
[Pending 5] [Accepted 3] [Rejected 1] [Completed 12]

┌──────────────┬──────────┬────────────┬──────────────┬────────────┬──────────┐
│ ID      │ Karyawan │ Amount │ Reason │ Date │ Actions │
├──────────────┼──────────┼────────────┼──────────────┼────────────┼──────────┤
│ #00123 │ Budi    │ 1.2M │ Kantor  │ 2d │ ✓ ✗    │
└──────────────┴──────────┴────────────┴──────────────┴────────────┴──────────┘
```

---

## 🚀 Implementation Steps (1-2 minggu)

### Week 1: Core + Auth
```
[ ] 1. npx create-next-app@latest issue-mvp --typescript --tailwind --app
[ ] 2. npm i @supabase/supabase-js @supabase/ssr @hookform/resolvers zod lucide-react
[ ] 3. Setup Supabase project + env vars (anon key, service role)
[ ] 4. Buat tables + RLS policies (copy SQL di atas)
[ ] 5. Auth middleware + login page
[ ] 6. /issues/new (Server Action create issue)
[ ] 7. /issues (role-based list)
```

### Week 2: Dashboard + Scan
```
[ ] 8. Storage bucket "receipts" + upload policy
[ ] 9. /issues/[id] (detail + scan upload → complete)
[ ]10. /dashboard (bendahara stats)
[ ]11. /dashboard/status (tab per status)
[ ]12. Realtime subscription (status updates)
[ ]13. Testing + cleanup
```

---

## 🛡️ Security Checklist
```
✅ RLS policies (tidak bisa di-bypass client)
✅ Server Actions (tidak ada client DB write)
✅ Role validation di server component
✅ Input validation (Zod)
✅ Storage signed URLs
✅ Middleware auth protection
✅ Service role key hanya di server
```

---

## 📦 Storage Bucket (receipts)
```sql
-- Public read setelah upload
CREATE POLICY "Public read receipts" ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');

-- Upload hanya untuk issue owner
CREATE POLICY "Issue owner upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts');
```

---

## 🎮 Next Features (post-MVP)
- [ ] Notifikasi email (Supabase Edge Functions)
- [ ] Export CSV per kategori
- [ ] Bulk accept/reject
- [ ] History log per issue
- [ ] QR code scan struk

**MVP siap launch dalam 10 hari kerja! 🚀**
