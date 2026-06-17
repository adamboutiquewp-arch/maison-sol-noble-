-- ============================================================
-- SETUP SUPABASE — CRM Maison Sol Noble
-- Copie-colle ce SQL dans Supabase > SQL Editor > New Query
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

-- Politique RLS (Row Level Security) — accès uniquement authentifié
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;

-- Pour un usage simple sans auth (à sécuriser en prod) :
CREATE POLICY "Accès libre devis" ON devis FOR ALL USING (true);

-- Données de démo (optionnel — supprimer en prod)
INSERT INTO devis (numero, client_nom, client_tel, client_email, ville, type_sol, travaux, surface, prix_m2, montant_ht, etat, statut) VALUES
  ('MSN-001', 'Sophie L.', '06 12 34 56 78', 'sophie@email.com', 'Paris 16ème', 'marbre', 'Rénovation complète', 65, 55, 4290, 'mauvais', 'Gagné'),
  ('MSN-002', 'Pierre M.', '07 98 76 54 32', 'pierre@email.com', 'Cannes', 'travertin', 'Rénovation complète', 120, 50, 7200, 'moyen', 'Devis envoyé'),
  ('MSN-003', 'Marie R.', '06 55 44 33 22', 'marie@email.com', 'Lyon', 'parquet', 'Ponçage + vitrification', 80, 28, 2688, 'moyen', 'Contacté'),
  ('MSN-004', 'A. Fontaine', '06 11 22 33 44', '', 'Monaco', 'marbre', 'Cristallisation', 200, 45, 10800, 'bon', 'Devis envoyé')
ON CONFLICT (numero) DO NOTHING;
