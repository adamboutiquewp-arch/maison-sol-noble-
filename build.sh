#!/bin/bash
# ============================================================
# Script de build — Maison Sol Noble
# Injecte les secrets (variables d'environnement Render) dans
# le code statique au moment du déploiement, pour qu'aucun
# identifiant ne soit jamais écrit en clair dans le dépôt Git.
# ============================================================

set -e

# --- Vérifications ---
if [ -z "$CRM_AUTH_PASSWORD" ]; then
  echo "ERREUR : CRM_AUTH_PASSWORD non défini dans Render > Environment"
  exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "ERREUR : SUPABASE_ANON_KEY non défini dans Render > Environment"
  exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "ERREUR : SUPABASE_URL non défini dans Render > Environment"
  exit 1
fi

# --- Injection dans crm/index.html ---
sed -i "s#__CRM_AUTH_PASSWORD__#${CRM_AUTH_PASSWORD}#g" crm/index.html
sed -i "s#__SUPABASE_ANON_KEY__#${SUPABASE_ANON_KEY}#g" crm/index.html
sed -i "s#__SUPABASE_URL__#${SUPABASE_URL}#g" crm/index.html

# --- Injection dans index.html (config Supabase formulaire de contact) ---
sed -i "s#__SUPABASE_ANON_KEY__#${SUPABASE_ANON_KEY}#g" index.html
sed -i "s#__SUPABASE_URL__#${SUPABASE_URL}#g" index.html

# --- Injection dans script.js (formulaire de contact site vitrine) ---
sed -i "s#__SUPABASE_ANON_KEY__#${SUPABASE_ANON_KEY}#g" script.js
sed -i "s#__SUPABASE_URL__#${SUPABASE_URL}#g" script.js

echo "Build terminé : tous les secrets injectés depuis les variables d'environnement Render."
