-- ============================================================
-- CRÉER TON COMPTE ADMIN — Maison Sol Noble CRM
-- Colle ce SQL dans Supabase > SQL Editor > New Query
-- Remplace l'email et le mot de passe avant de lancer !
-- ============================================================

-- Crée le compte utilisateur admin
SELECT supabase_admin.create_user(
  '{"email": "contact@maisonsolnoble.com", "password": "TonMotDePasse2025!", "email_confirm": true}'::jsonb
);

-- Si la fonction ci-dessus ne marche pas, utilise celle-ci à la place :
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'contact@maisonsolnoble.com',
  crypt('TonMotDePasse2025!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;
