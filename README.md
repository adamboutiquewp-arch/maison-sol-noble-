# Maison Sol Noble — Site Vitrine

## Fichiers inclus
- `index.html` — Page principale (structure complète)
- `style.css` — Tout le design (noir & or, responsive)
- `script.js` — Interactions, formulaire, animations

## Mise en ligne rapide
1. Héberge les 3 fichiers sur n'importe quel hébergeur (OVH, Hostinger, Infomaniak...)
2. Configure le formulaire de contact (voir ci-dessous)
3. Remplace les illustrations SVG par tes vraies photos quand tu les auras

## Configurer le formulaire de contact (GRATUIT)
1. Va sur https://formspree.io et crée un compte gratuit
2. Crée un nouveau formulaire avec l'email : contact@maisonsolnoble.com
3. Copie ton Form ID (ex: xpzgabcd)
4. Dans script.js ligne 34, remplace YOUR_FORM_ID par ton ID :
   `const FORMSPREE_URL = 'https://formspree.io/f/xpzgabcd';`

→ Sans configuration, le formulaire ouvre automatiquement le client mail comme solution de secours.

## Remplacer une illustration par une vraie photo
Dans index.html, cherche la section du service concerné.
Remplace le bloc `<div class="service-visual"><svg ...></svg></div>` par :
`<div class="service-visual"><img src="ton-image.jpg" alt="Description" style="width:100%;height:220px;object-fit:cover;"></div>`

## Infos de contact dans le site
- Téléphone : 05 54 54 28 64
- Email : contact@maisonsolnoble.com
- Pour modifier : chercher "0554542864" et "contact@maisonsolnoble.com" dans index.html

## Couleurs de la charte
- Or principal : #c9a84c
- Fond sombre : #0d0d0d
- Fond sections : #111 / #141414
- Texte principal : #f0ece4
- Texte secondaire : #8a8070

## Polices utilisées (Google Fonts)
- Cormorant Garamond (titres) — élégante et luxueuse
- Inter (corps de texte) — lisible et moderne

## Hébergeurs recommandés
- OVH Perso (~2€/mois) — français, fiable
- Infomaniak (~4€/mois) — suisse, éco-responsable
- Hostinger (~3€/mois) — international, rapide

## Nom de domaine suggéré
- maisonsolnoble.fr ou maisonsolnoble.com
