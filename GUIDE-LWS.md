# 🌐 Guide de mise en ligne — LWS

## ÉTAPE 1 — Acheter l'hébergement sur LWS

1. Va sur https://www.lws.fr
2. Clique sur "Hébergement Web" → choisis l'offre "Perso" (~2,49€/mois)
3. Durant la commande, tu peux soit :
   - Transférer ton domaine maisonsolnoble.com vers LWS (recommandé, ~10€/an)
   - Ou juste pointer ton domaine existant vers LWS (voir étape 3B)

---

## ÉTAPE 2 — Mettre le site en ligne (FTP)

### Option A — Via le gestionnaire de fichiers LWS (le plus simple)
1. Connecte-toi à ton espace client LWS → https://panel.lws.fr
2. Clique sur "Gestionnaire de fichiers"
3. Entre dans le dossier `www` ou `public_html`
4. Clique "Uploader" et sélectionne les 3 fichiers :
   - index.html
   - style.css
   - script.js
5. C'est tout — ton site est en ligne !

### Option B — Via FileZilla (FTP, pour les pros)
1. Télécharge FileZilla : https://filezilla-project.org
2. Dans ton espace LWS, trouve tes identifiants FTP :
   Espace client → Hébergement → Accès FTP
3. Dans FileZilla :
   - Hôte : ftp.maisonsolnoble.com (ou l'IP fournie par LWS)
   - Identifiant : ton login FTP LWS
   - Mot de passe : ton mot de passe FTP
   - Port : 21
4. Glisse tes 3 fichiers dans le dossier `www` ou `public_html`

---

## ÉTAPE 3A — Ton domaine est chez LWS (domaine + hébergement LWS)

Rien à faire ! LWS connecte automatiquement le domaine à l'hébergement.
Attends 24-48h de propagation DNS et ton site est accessible.

---

## ÉTAPE 3B — Ton domaine est chez un autre registrar

Tu dois pointer ton domaine vers les serveurs LWS.

### Dans l'interface de ton registrar actuel, modifie les DNS :

**Serveurs de noms LWS (nameservers) :**
```
ns1.lws.fr
ns2.lws.fr
```

**OU si tu préfères garder tes DNS actuels, crée ces enregistrements A :**
```
Type : A
Nom  : @ (ou maisonsolnoble.com)
Valeur : [l'adresse IP de ton hébergement LWS]
TTL  : 3600
```
```
Type : A
Nom  : www
Valeur : [l'adresse IP de ton hébergement LWS]
TTL  : 3600
```

→ L'adresse IP de ton hébergement LWS se trouve dans :
   Espace client LWS → Hébergement → Informations techniques

⚠️ La propagation DNS prend entre 1h et 48h. Sois patient !

---

## ÉTAPE 4 — Activer le HTTPS (SSL gratuit)

1. Dans ton espace client LWS → Hébergement → SSL/TLS
2. Clique "Activer Let's Encrypt" (gratuit)
3. Attends 10 minutes → ton site est sécurisé avec https://

---

## ÉTAPE 5 — Configurer le formulaire de contact

1. Va sur https://formspree.io → Créer un compte gratuit
2. "New Form" → Email : contact@maisonsolnoble.com
3. Copie ton Form ID (exemple : xabcdefg)
4. Dans script.js, ligne 34, remplace :
   `const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';`
   par :
   `const FORMSPREE_URL = 'https://formspree.io/f/xabcdefg';`
5. Ré-uploade script.js sur ton hébergement

---

## RÉCAPITULATIF RAPIDE

```
[Acheter hébergement LWS]
        ↓
[Uploader 3 fichiers dans /www]
        ↓
[Pointer domaine vers LWS (si nécessaire)]
        ↓
[Activer SSL gratuit]
        ↓
[Configurer Formspree]
        ↓
🎉 Site en ligne sur maisonsolnoble.com !
```

---

## Besoin d'aide ?

Support LWS : https://aide.lws.fr
Téléphone LWS : 09 72 10 10 07 (lun-ven 9h-18h)
