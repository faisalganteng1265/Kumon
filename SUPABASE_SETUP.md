# Supabase Database Setup Guide

## 📋 Overview
Panduan ini akan membantu Anda membuat table yang diperlukan di Supabase untuk fitur authentication AICampus.

## 🔑 Supabase Configuration
- **Project URL**: `https://djbgqcraxwczlxtlofxu.supabase.co`
- **Environment Variables**: Sudah dikonfigurasi di `.env.local`

## 📊 Database Schema

### 1. Table: `profiles`

Table ini digunakan untuk menyimpan informasi profil user yang melengkapi data authentication bawaan Supabase.

#### SQL untuk membuat table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 🚀 Cara Setup di Supabase Dashboard

### Step 1: Buka SQL Editor
1. Login ke Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

### Step 2: Jalankan SQL Script
1. Copy semua SQL code dari section "Database Schema" di atas
2. Paste ke SQL Editor
3. Klik tombol **Run** atau tekan `Ctrl + Enter`

### Step 3: Verifikasi Table
1. Klik menu **Table Editor** di sidebar kiri
2. Anda harus melihat table `profiles` dengan kolom:
   - `id` (uuid, primary key)
   - `username` (text, unique)
   - `email` (text, unique)
   - `avatar_url` (text, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### Step 4: Verifikasi RLS Policies
1. Klik menu **Authentication** > **Policies**
2. Pastikan ada 3 policies untuk table `profiles`:
   - "Users can view own profile"
   - "Users can update own profile"
   - "Users can insert own profile"

## 📝 Column Description

### Table: profiles

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, foreign key ke `auth.users(id)` |
| `username` | TEXT | Username unik untuk user |
| `email` | TEXT | Email user (sync dengan auth.users) |
| `avatar_url` | TEXT | URL untuk foto profil user (opsional) |
| `created_at` | TIMESTAMP | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | Waktu terakhir update (auto-update) |

## 🔒 Row Level Security (RLS)

RLS memastikan bahwa:
- ✅ User hanya bisa melihat profil mereka sendiri
- ✅ User hanya bisa update profil mereka sendiri
- ✅ User hanya bisa insert profil mereka sendiri
- ❌ User tidak bisa melihat atau memodifikasi profil user lain

## 🎯 Authentication Flow

### Sign Up Flow:
1. User mengisi form signup (username, email, password)
2. System membuat user di `auth.users` (Supabase Auth)
3. System otomatis membuat record di `profiles` table
4. User menerima email verifikasi

### Login Flow:
1. User mengisi form login (email, password)
2. System verifikasi credentials dengan Supabase Auth
3. System mengambil data profil dari `profiles` table
4. User berhasil login dan session tersimpan

## 🔧 Environment Variables

Pastikan `.env.local` sudah terisi dengan benar:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://djbgqcraxwczlxtlofxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Note**: Ganti `your_actual_anon_key_here` dengan Anon Key dari Supabase Dashboard:
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Settings** > **API**
4. Copy **anon/public** key

## 🧪 Testing

Setelah setup selesai, test fitur authentication:

1. **Test Sign Up**:
   - Klik tombol "Login" di Navbar
   - Pilih tab "Sign Up"
   - Isi username, email, dan password
   - Submit form
   - Cek email untuk verifikasi

2. **Test Login**:
   - Klik tombol "Login" di Navbar
   - Pilih tab "Login"
   - Masukkan email dan password
   - Submit form
   - User berhasil login

3. **Test Logout**:
   - Setelah login, klik tombol "Login" (akan berubah fungsi)
   - Konfirmasi logout
   - User berhasil logout

## 📚 Additional Tables (Optional - Future Enhancement)

Jika Anda ingin menambahkan fitur lanjutan, berikut adalah table tambahan yang bisa dibuat:

### Table: `user_preferences`
```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'id',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: `chat_history`
```sql
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  mode TEXT NOT NULL CHECK (mode IN ('campus', 'general')),
  university TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat history"
  ON chat_history
  FOR ALL
  USING (auth.uid() = user_id);
```

## ✅ Checklist Setup

- [ ] Jalankan SQL script untuk membuat table `profiles`
- [ ] Verifikasi table sudah terbuat di Table Editor
- [ ] Verifikasi RLS policies sudah aktif
- [ ] Update `.env.local` dengan Supabase Anon Key yang benar
- [ ] Restart development server (`npm run dev`)
- [ ] Test sign up functionality
- [ ] Test login functionality
- [ ] Test logout functionality

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar di `.env.local`
- Restart development server setelah update `.env.local`

### Error: "Row Level Security policy violation"
- Pastikan RLS policies sudah dibuat dengan benar
- Cek di Supabase Dashboard > Authentication > Policies

### Error: "relation profiles does not exist"
- Pastikan SQL script sudah dijalankan dengan benar
- Cek di Table Editor apakah table `profiles` sudah ada

## 📞 Support

Jika ada masalah, cek:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
