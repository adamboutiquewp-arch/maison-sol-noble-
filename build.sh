#!/bin/bash
# ============================================================
# Script de build — Maison Sol Noble
# Injecte les secrets via Node.js (plus fiable que sed)
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

echo "=== Variables d'environnement OK ==="
echo "SUPABASE_URL : ${SUPABASE_URL:0:30}..."

# --- Injection via Node.js ---
node -e "
const fs = require('fs');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const pwd = process.env.CRM_AUTH_PASSWORD;

const files = ['index.html', 'crm/index.html', 'script.js'];

files.forEach(function(f) {
  try {
    let c = fs.readFileSync(f, 'utf8');
    let n = 0;
    c = c.replace(/__SUPABASE_URL__/g, function() { n++; return url; });
    c = c.replace(/__SUPABASE_ANON_KEY__/g, function() { n++; return key; });
    c = c.replace(/__CRM_AUTH_PASSWORD__/g, function() { n++; return pwd; });
    fs.writeFileSync(f, c, 'utf8');
    console.log('OK ' + f + ' (' + n + ' remplacements)');
  } catch(e) {
    console.error('ERREUR ' + f + ': ' + e.message);
    process.exit(1);
  }
});
"

echo "Build terminé : tous les secrets injectés depuis les variables d'environnement Render."
