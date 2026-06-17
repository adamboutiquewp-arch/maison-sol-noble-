# CRM Maison Sol Noble — Guide d'installation

## Ce que fait ce CRM

- Créer un devis en 2 minutes (pendant un appel client)
- Générer un PDF professionnel avec logo et tarifs automatiques
- Suivre les statuts (Nouveau → Contacté → Devis envoyé → Gagné / Perdu)
- Planning des chantiers par semaine
- Fiche client avec historique
- Convertir un devis en facture en 1 clic
- Accessible mobile + desktop

---

## ÉTAPE 1 — Créer le projet Supabase (5 min)

1. Va sur https://supabase.com → "Start your project"
2. Crée un compte gratuit
3. "New project" → Nom : `maison-sol-noble-crm`
4. Choisis une région : **West EU (Ireland)**
5. Crée un mot de passe fort → "Create new project"
6. Attends 2 minutes que le projet se crée

### Récupérer tes clés :
- Dans Supabase → **Settings** → **API**
- Copie : `Project URL` → c'est ton `SUPABASE_URL`
- Copie : `anon public` → c'est ton `SUPABASE_KEY`

---

## ÉTAPE 2 — Créer la base de données (2 min)

1. Dans Supabase → **SQL Editor** → "New Query"
2. Colle tout le contenu du fichier `supabase-setup.sql`
3. Clique "Run" (▶)
4. Tu dois voir "Success. No rows returned"

---

## ÉTAPE 3 — Connecter le CRM à Supabase

Dans le fichier `CRM.jsx`, ligne 5-6, remplace :

```javascript
const SUPABASE_URL = "https://TON_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "TON_ANON_KEY";
```

Par tes vraies valeurs, exemple :
```javascript
const SUPABASE_URL = "https://abcdefghij.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

---

## ÉTAPE 4 — Déployer sur Render (même que le site)

### Option A — Application séparée (recommandé)

1. Crée un nouveau repo GitHub : `crm-sol-noble`
2. Upload `CRM.jsx` dedans
3. Crée un `index.html` avec ce contenu :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM — Maison Sol Noble</title>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { createElement } from 'https://esm.sh/react@18';
    import { createRoot } from 'https://esm.sh/react-dom@18/client';
    import CRM from './CRM.jsx';
    createRoot(document.getElementById('root')).render(createElement(CRM));
  </script>
</body>
</html>
```

4. Sur Render → "New Static Site"
5. Connecte le repo `crm-sol-noble`
6. URL : `crm.maisonsolnoble.com` (ou `crm-sol-noble.onrender.com`)

### Option B — Intégrer au site existant
Ajoute `CRM.jsx` dans ton repo `maison-sol-noble`
et crée `/crm/index.html` qui charge le composant.

---

## ÉTAPE 5 — Accès sécurisé (optionnel mais recommandé)

Pour protéger le CRM avec un mot de passe :

Dans Render → ton service CRM → **Environment** → Ajouter :
```
PASSWORD=tonmotdepasse
```

Ou ajoute un simple écran de login dans le composant (je peux le coder).

---

## Utilisation quotidienne

### Créer un devis pendant un appel client :
1. Ouvre le CRM sur ton téléphone
2. Clique "+ Devis rapide"
3. Remplis : nom, téléphone, ville, type de sol, surface
4. Le prix se calcule automatiquement
5. Clique "Créer le devis" → PDF généré
6. Ouvre le PDF → Imprime ou partage

### Convertir en facture :
1. Dans la liste des devis → clique "→ Facture"
2. Le PDF facture s'ouvre automatiquement
3. Le statut passe à "Gagné"

---

## Personnalisation des tarifs

Dans `CRM.jsx`, cherche `const TARIFS` (ligne ~20) :
```javascript
const TARIFS = {
  marbre: { travaux: [...], prix: [30, 55, 45, 14] },
  ...
}
```
Modifie les prix selon tes tarifs réels.

---

## Support

Email : contact@maisonsolnoble.com
