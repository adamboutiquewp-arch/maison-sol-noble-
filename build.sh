#!/bin/bash
# ============================================================
# Script de build — Maison Sol Noble
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

echo "=== Variables OK : URL=${SUPABASE_URL:0:25}... ==="

# --- Génère config.js avec les vraies valeurs (nouveau fichier créé au build) ---
cat > config.js << CONFIGEOF
window._SUPA_URL="${SUPABASE_URL}";
window._SUPA_KEY="${SUPABASE_ANON_KEY}";
CONFIGEOF
echo "OK config.js généré"

# --- Injection dans crm/index.html ---
node -e "
const fs = require('fs');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const pwd = process.env.CRM_AUTH_PASSWORD;
let c = fs.readFileSync('crm/index.html', 'utf8');
c = c.replace(/__SUPABASE_URL__/g, url);
c = c.replace(/__SUPABASE_ANON_KEY__/g, key);
c = c.replace(/__CRM_AUTH_PASSWORD__/g, pwd);
fs.writeFileSync('crm/index.html', c, 'utf8');
console.log('OK crm/index.html');
"

echo "Build terminé."
