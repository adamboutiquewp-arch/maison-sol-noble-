# Maison Sol Noble — v4 : Site corrigé + stratégie de lancement Meta Ads

## ⚠️ Action requise immédiatement après déploiement

### 1. Render — fichiers ajoutés dans cette version
- **`render.yaml`** : corrige le Content-Type du `sitemap.xml` (était servi en "binary data", empêchait Google de le lire). Render doit détecter ce fichier automatiquement au prochain déploiement.
- **`_redirects`** : corrigé pour converger vers une seule URL canonique **`https://maisonsolnoble.com` (sans www)** — cohérent avec toutes les URLs déjà présentes dans `sitemap.xml` et `index.html`. Avant, le fichier redirigeait par erreur vers des versions contradictoires (boucle potentielle).

### 2. Google Search Console — à corriger côté toi
Tu avais vérifié et soumis le sitemap sur la propriété **`www.maisonsolnoble.com`**. Comme la version canonique du site est **sans www**, il faut :
1. Dans Search Console, passe sur la propriété **`maisonsolnoble.com`** (celle en haut de la liste, type "Domaine" — pas celle en `https://www...`)
2. Soumets à nouveau `sitemap.xml` depuis cette propriété
3. Une fois le nouveau `render.yaml` déployé, attends 24-48h puis vérifie que le sitemap passe en statut "Réussite" (pas "Impossible de récupérer")

### 3. Vérification technique (optionnelle mais recommandée)
Après le déploiement Render, un développeur ou toi-même pouvez vérifier avec :
```
curl -I https://maisonsolnoble.com/sitemap.xml
```
La ligne `content-type:` doit afficher `application/xml` (pas `application/octet-stream` ni `text/html`).

---



Cette version corrige deux problèmes bloquants identifiés dans le site reçu, et recentre la stratégie commerciale sur les bonnes zones géographiques.

### 1. Images manquantes → créées
Le dossier `/images/` n'existait pas dans le v3 : 14 fichiers étaient référencés dans le HTML mais absents, ce qui cassait l'affichage (hero, avant/après marbre, parquet, travertin, granito, logo, image de partage réseaux sociaux).

**Choix effectué : illustrations honnêtes, pas de fausses photos de chantier.** Les images créées sont des textures/illustrations générées (marbre, parquet, granito) dans la charte noir & or du site. Elles ne sont jamais présentées comme des photos de chantiers réels — chaque légende a été corrigée pour dire "illustration" plutôt que d'affirmer un faux lieu/client. Dès que tu auras de vraies photos de chantier, elles devront remplacer ces fichiers (même noms de fichiers dans `/images/`, donc le remplacement est direct).

### 2. Contenu trompeur retiré
Le site v3 affichait :
- Un faux avis client ("Sophie L.", 5 étoiles) et une fausse note agrégée (4.9★ / 127 avis) dans les données structurées Schema.org
- De fausses statistiques d'entreprise ("15+ années d'expertise", "500+ chantiers réalisés") alors que la structure Maison Sol Noble vient d'être immatriculée
- De faux témoignages clients localisés dans **18 pages villes** (ex: "Sophie L., Cap d'Antibes", "Marc T., Castanet-Tolosan"...) et sur la page d'accueil

Ce type de contenu relève de la pratique commerciale trompeuse (article L121-1 du Code de la consommation : faux avis, fausse antériorité, fausse clientèle) et représente un risque réputationnel direct sur une clientèle haut de gamme exigeante.

**Remplacé par un message honnête et valorisant** : mise en avant des 10 ans d'expérience artisanale réelle du fondateur (acquise en entreprise familiale), du statut de nouvelle structure SASU, et de l'engagement de transparence. C'est un message différent mais tout aussi vendeur — "nouvelle structure, savoir-faire éprouvé" plutôt que "fausse ancienneté".

> Le CRM (`crm/CRM.jsx`) contient lui aussi des données "Sophie L. / Pierre M. / Marie R." — celles-ci sont explicitement commentées `// Mode démo — données factices` dans le code et ne sont visibles que par toi en interne (outil de gestion, pas page publique). Aucune correction nécessaire ici, mais à vider/remplacer par tes vraies données dès ton premier client.

### 3. Recentrage géographique
Le site v3 visait "Toute la France". Sur ta demande, le ciblage commercial est recentré sur tes 3 zones prioritaires :
- **Côte d'Azur** (Nice, Cannes, Antibes, Saint-Tropez, Monaco)
- **Île-de-France** (Paris, Neuilly-sur-Seine, Versailles, Saint-Germain-en-Laye)
- **Côte Basque** (Biarritz, Bayonne, Saint-Jean-de-Luz)

Modifié : hero, barre d'urgence, section zone d'intervention, FAQ, liens internes, meta title/description, Schema.org `areaServed`. Le sitemap garde toutes les pages villes existantes (Toulouse, Lyon, Marseille, Bordeaux, Nantes, Lille incluses) mais avec une priorité SEO abaissée (0.6 au lieu de 0.8-0.9) puisqu'elles sont hors zone prioritaire — ça reste gratuit de les garder indexées, donc aucune raison de les supprimer.

### 4. Pourquoi ces choix
- **Mentir sur l'antériorité/les avis expose légalement et tue la confiance** sur un marché où le panier moyen se compte en milliers d'euros et où la clientèle vérifie.
- **Ton expérience réelle de 10 ans est un argument plus solide qu'une fausse statistique** — elle est vraie, vérifiable si on te pose la question, et elle raconte une histoire crédible ("nouvelle structure, savoir-faire ancien").
- **Le budget pub (<500€/mois) ne peut pas financer 3 zones non-contiguës en même temps** sans diluer l'apprentissage de l'algorithme Meta. Recommandation maintenue : démarrer sur une seule zone (Côte d'Azur en priorité, cf. stratégie ci-dessous), dupliquer ensuite.

---

## Stratégie de lancement Meta Ads — rappel synthétique

1. **Zone de lancement recommandée : Côte d'Azur** (forte densité de résidences secondaires haut de gamme — ex. 66% à Saint-Tropez —, pages SEO déjà prêtes, saisonnalité favorable en juin).
2. **Objectif de campagne : Génération de leads (formulaire instantané)**, pas Trafic ni Notoriété.
3. **Budget** : 16-17€/jour, un seul ad set, 3 créatifs maximum, pas de dispersion.
4. **Formulaire Lead Ads natif** (pas Formspree) : Nom, Téléphone, Type de sol, Surface, Ville — pour pré-qualifier chaque lead.
5. **Créatifs prioritaires** : vidéo avant/après en time-lapse > carrousel avant/après > image statique. **Dès le premier chantier réel, le filmer/photographier** — ce sera le contenu organique ET publicitaire le plus rentable.
6. **CRM déjà en place** (Supabase + interface React) : brancher les leads Meta dedans, rappel sous 1h.

## Prochaines étapes possibles
- Brancher le formulaire Lead Ads Meta → CRM Supabase
- Rédiger 5-6 variantes de texte publicitaire (hooks différents pour A/B test)
- Calendrier édito Instagram/Facebook semaines 1 à 4
- Script d'appel pour le suivi commercial des leads
- Dès les premiers vrais chantiers : remplacer les illustrations par de vraies photos avant/après et réintroduire des avis clients réels

---

## Structure du projet
```
maison-sol-noble/
├── index.html              # Page d'accueil (corrigée)
├── style.css / page-style.css
├── script.js
├── images/                  # 14 fichiers créés (illustrations honnêtes, charte noir & or)
├── villes/                  # 18 pages SEO villes (témoignages factices retirés)
├── blog/                    # 8 articles de blog (vérifiés, aucune correction nécessaire)
├── crm/                     # Outil interne de gestion devis/clients (React + Supabase)
├── sitemap.xml              # Priorités ajustées sur les 3 zones cibles
├── mentions-legales.html / cgv.html / politique-confidentialite.html
└── SUMMARY.md               # Ce fichier
```

## Mise en ligne
Voir `GUIDE-LWS.md` pour la procédure d'hébergement déjà préparée dans le projet original.
