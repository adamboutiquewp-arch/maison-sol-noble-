-- ============================================================
-- SETUP SUPABASE — CRM Maison Sol Noble
-- Copie-colle ce SQL dans Supabase > SQL Editor > New Query
--
-- ⚠️ Ce script sert à recréer la structure depuis zéro si besoin
-- (nouvelle base, environnement de test...). Il ne contient PAS
-- de données de démonstration et active une vraie protection RLS
-- (authentifié uniquement), pas un accès libre.
-- ============================================================

-- Table devis
CREATE TABLE IF NOT EXISTS devis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  client_nom TEXT NOT NULL,
  client_tel TEXT,
  client_email TEXT,
  ville TEXT,
  type_sol TEXT NOT NULL CHECK (type_sol IN ('marbre','travertin','granito','parquet')),
  travaux TEXT NOT NULL,
  surface NUMERIC NOT NULL,
  prix_m2 NUMERIC NOT NULL,
  montant_ht NUMERIC,
  etat TEXT DEFAULT 'moyen' CHECK (etat IN ('bon','moyen','mauvais')),
  statut TEXT DEFAULT 'Nouveau' CHECK (statut IN ('Nouveau','Contacté','Devis envoyé','Gagné','Perdu')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_created ON devis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_nom);

-- Mise à jour auto de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER devis_updated_at
BEFORE UPDATE ON devis
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Politique RLS (Row Level Security) — accès réservé aux utilisateurs authentifiés uniquement.
-- Le CRM s'authentifie via un compte technique Supabase Auth (voir crm/index.html,
-- fonction getAppAuthToken). Sans ce token, aucune lecture ni écriture n'est possible.
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accès libre devis" ON devis
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Aucune donnée de démonstration n'est insérée par ce script.
-- Les premiers devis doivent provenir de vrais clients, créés
-- directement depuis le CRM une fois connecté.
