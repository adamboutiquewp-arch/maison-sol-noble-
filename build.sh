#!/bin/bash
# ============================================================
# Script de build — Maison Sol Noble
# Injecte les secrets (variables d'environnement Render) dans
# le code statique au moment du déploiement, pour qu'aucun
# mot de passe ne soit jamais écrit en clair dans le dépôt Git.
# ============================================================

set -e

if [ -z "$CRM_AUTH_PASSWORD" ]; then
  echo "ERREUR : la variable d'environnement CRM_AUTH_PASSWORD n'est pas définie sur Render."
  echo "Va dans Render > ton service > Environment, et ajoute CRM_AUTH_PASSWORD avec la vraie valeur."
  exit 1
fi

# Remplace le marqueur __CRM_AUTH_PASSWORD__ par la vraie valeur secrète
# Utilise un délimiteur '#' dans sed pour éviter les conflits si le mot de passe contient des '/'
sed -i "s#__CRM_AUTH_PASSWORD__#${CRM_AUTH_PASSWORD}#g" crm/index.html

echo "Build terminé : mot de passe CRM injecté depuis les variables d'environnement."
