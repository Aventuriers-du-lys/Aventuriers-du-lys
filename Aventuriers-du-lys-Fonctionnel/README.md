# Guide complet — Les Aventuriers du Lys

**Ce document explique, pas à pas, comment passer de « un ordinateur vide » à « un site web qui fonctionne ».**

Il est écrit pour quelqu’un qui n’est **pas** informaticien.  
Si un mot technique apparaît, il est expliqué juste après.

Prenez votre temps. Une étape à la fois. Si quelque chose ne marche pas, allez à la section **Problèmes fréquents** à la fin.

---

## Table des matières

1. [En une phrase : qu’est-ce que c’est ?](#1-en-une-phrase--quest-ce-que-cest-)
2. [Les mots importants (à lire une fois)](#2-les-mots-importants-à-lire-une-fois)
3. [Ce que vous devez décider](#3-ce-que-vous-devez-décider)
4. [OPTION A — Faire tourner le site sur VOTRE ordinateur (localhost)](#4-option-a--faire-tourner-le-site-sur-votre-ordinateur-localhost)
5. [Partager le site depuis chez vous (amis / Internet)](#5-partager-le-site-depuis-chez-vous-amis--internet)
6. [Acheter un nom de domaine (ex. aventuriersdlys.ca)](#6-acheter-un-nom-de-domaine)
7. [OPTION B — Héberger sur Azure (Microsoft, dans le nuage)](#7-option-b--héberger-sur-azure-microsoft)
8. [Comparer les coûts (estimation)](#8-comparer-les-coûts-estimation)
9. [Sauvegarder vos données (très important)](#9-sauvegarder-vos-données-très-important)
10. [Problèmes fréquents](#10-problèmes-fréquents)
11. [Comptes de démonstration](#11-comptes-de-démonstration)

---

## 1. En une phrase : qu’est-ce que c’est ?

C’est un **site web** pour trouver ou publier des parties de jeu de rôle.

Contrairement à l’ancien dossier (juste des pages HTML), cette version est une **vraie application** :

- les gens peuvent créer un **compte**
- les **réservations** sont sauvegardées
- plusieurs personnes peuvent utiliser le site **en même temps**
- tout est stocké dans un petit fichier sur le disque (comme un classeur Excel, mais pour le site)

Le look du site ressemble volontairement à l’ancienne version.

---

## 2. Les mots importants (à lire une fois)

### Navigateur
C’est le programme pour aller sur Internet : **Chrome**, **Edge**, **Firefox**, **Safari**.  
Vous l’utilisez déjà tous les jours.

### Site web / application web
Des pages que le navigateur affiche.  
Derrière, un petit programme (le « serveur ») répond aux demandes : « montre-moi les parties », « connecte-moi », etc.

### Node.js
Un logiciel gratuit qu’on installe sur l’ordinateur.  
Il sert à **faire tourner** notre application (comme Word fait tourner un document `.docx`).

Sans Node.js → le site ne démarre pas sur votre PC.

### Terminal / Invite de commandes / PowerShell
Une fenêtre noire (ou bleue) où on tape des ordres au lieu de cliquer.  
Pas besoin d’avoir peur : on vous donne les phrases exactes à copier-coller.

### Localhost
Adresse magique qui veut dire : **« mon propre ordinateur »**.

Quand vous ouvrez `http://localhost:3000`, vous visitez le site **chez vous**, pas sur Internet.  
Personne d’autre ne le voit, sauf si vous faites des étapes supplémentaires (section 5).

### Port (exemple : 3000)
Imaginez votre ordinateur comme un immeuble.  
L’adresse Internet de l’immeuble, c’est l’IP.  
Le **port**, c’est le **numéro d’appartement**.

Notre site habite à l’appartement **3000**.  
Donc on écrit : `http://localhost:3000`

### Base de données (SQLite)
Un fichier nommé `app.db` dans le dossier `data`.  
C’est là que sont stockés : comptes, parties, réservations, profils.

**Si vous perdez ce fichier, vous perdez les données du site.**  
D’où l’importance des sauvegardes (section 9).

### Hébergement (hosting)
Mettre le site sur un ordinateur qui est **allumé 24 h / 24** et accessible depuis Internet.  
Azure (Microsoft) est un exemple d’hébergeur.

### Nom de domaine
Le joli nom qu’on tape dans le navigateur, par exemple :

- `aventuriersdlys.ca`
- `lesaventuriersdlys.com`

Sans domaine, le site a souvent une adresse moche genre :  
`https://quelquechose.azurewebsites.net`

### DNS
Le « annuaire téléphonique » d’Internet.  
Il dit : « quand quelqu’un tape mon nom de domaine, envoie-le vers tel ordinateur ».

---

## 3. Ce que vous devez décider

| Objectif | Choisissez |
|----------|------------|
| Tester le site **seul**, sur votre PC | **Option A** (localhost) — gratuit |
| Montrer le site à des amis **sans** payer Azure | Option A + outil comme **ngrok** (section 5) |
| Site ouvert au public, fiable, allumé tout le temps | **Option B** (Azure) — payant, environ 15–25 $/mois |
| Avoir une belle adresse (`.ca`, `.com`) | Acheter un **domaine** (section 6) — environ 15–20 $/an |

**Conseil pour commencer :** faites d’abord l’Option A. Quand ça marche chez vous, seulement ensuite passez à Azure.

---

## 4. OPTION A — Faire tourner le site sur VOTRE ordinateur (localhost)

Durée estimée : **20 à 40 minutes** la première fois.  
Coût : **0 $**.

### Étape A1 — Vérifier que vous avez Windows à jour

1. Cliquez sur le menu **Démarrer** (icône Windows en bas à gauche).
2. Tapez `Windows Update` et ouvrez-le.
3. Cliquez sur **Rechercher les mises à jour**.
4. Installez ce qu’il propose, redémarrez si on vous le demande.

Ce n’est pas obligatoire à 100 %, mais ça évite des surprises.

### Étape A2 — Télécharger Node.js (obligatoire)

1. Ouvrez votre navigateur.
2. Allez sur ce site officiel :  
   **https://nodejs.org/**
3. Vous verrez deux gros boutons. Choisissez celui qui dit **LTS**  
   (LTS = version stable, recommandée — prenez **celle-là**, pas « Current »).
4. Le fichier téléchargé ressemble à : `node-vXX.X.X-x64.msi`
5. Double-cliquez dessus pour lancer l’installation.
6. Cliquez **Next**, **Next**, **Next**…
7. **Important :** laissez cochée l’option du genre  
   *« Automatically install the necessary tools »* / *Add to PATH*  
   si elle apparaît. Ne décochez rien d’étrange.
8. Terminez l’installation (**Finish**).
9. **Fermez** toutes les fenêtres de terminal déjà ouvertes (si vous en aviez).  
   Sinon Windows ne « voit » pas encore Node.

### Étape A3 — Vérifier que Node est bien installé

1. Cliquez sur **Démarrer**.
2. Tapez : `PowerShell`
3. Ouvrez **Windows PowerShell**.
4. Copiez-collez exactement cette ligne, puis appuyez sur **Entrée** :

```powershell
node -v
```

Vous devez voir quelque chose comme : `v20.11.0` (le numéro peut différer).

Ensuite tapez :

```powershell
npm -v
```

Vous devez voir un numéro (ex. `10.9.2`).

✅ Si les deux commandes affichent un numéro → Node est prêt.  
❌ Si Windows dit « *n’est pas reconnu* » → redémarrez l’ordinateur, puis réessayez. Si ça échoue encore, réinstallez Node.

### Étape A4 — Avoir le dossier du projet sur le PC

Vous devez avoir ce dossier sur le Bureau (ou ailleurs) :

```
C:\Users\VOTRE_NOM\Desktop\Aventuriers-du-lys-app
```

À l’intérieur, vous devez voir entre autres :

- `package.json`
- `server` (dossier)
- `public` (dossier)
- `scripts` (dossier)
- `README.md` (ce guide)

Si vous n’avez pas ce dossier, copiez-le depuis la clé USB / le partage / le courriel de la personne qui vous l’a donné.

### Étape A5 — Première installation des « pièces détachées »

La première fois seulement, l’ordinateur doit télécharger des petites bibliothèques (dépendances).

**Méthode facile (recommandée) :**

1. Ouvrez le dossier `Aventuriers-du-lys-app`
2. Ouvrez le dossier `scripts`
3. Double-cliquez sur **`start.bat`**
4. Une fenêtre noire s’ouvre.
5. La première fois, ça peut prendre **1 à 3 minutes** (téléchargement).
6. Quand c’est prêt, vous verrez un message du genre :

```text
Aventuriers du Lys prêt sur http://localhost:3000
```

**Ne fermez pas cette fenêtre noire.**  
Tant qu’elle est ouverte, le site fonctionne.  
Si vous la fermez, le site s’arrête (comme éteindre la télé).

### Étape A6 — Ouvrir le site dans le navigateur

1. Ouvrez Chrome ou Edge.
2. Dans la barre d’adresse (en haut), tapez exactement :

```text
http://localhost:3000
```

3. Appuyez sur **Entrée**.

Vous devez voir le site **Les Aventuriers du Lys**.

### Étape A7 — Tester que ça marche vraiment

1. Cliquez sur **Créer un compte** (ou allez sur `http://localhost:3000/compte.html`).
2. Créez un compte avec votre courriel.
3. Mot de passe : au moins **8 caractères**.
4. Revenez à l’accueil.
5. Essayez **Réserver** sur une partie.

Si la réservation fonctionne → bravo, votre application web tourne chez vous.

### Arrêter / relancer le site

| Action | Comment |
|--------|---------|
| **Arrêter** | Fermer la fenêtre noire, ou cliquer dedans et faire `Ctrl + C`, puis Entrée |
| **Relancer** | Double-cliquer encore sur `scripts\start.bat` |

### Méthode manuelle (si le `.bat` ne marche pas)

1. Ouvrez PowerShell.
2. Allez dans le dossier du projet (adaptez le chemin) :

```powershell
cd "C:\Users\VOTRE_NOM\Desktop\Aventuriers-du-lys-app"
```

3. Installez (une seule fois) :

```powershell
npm install
```

4. Démarrez :

```powershell
npm start
```

5. Ouvrez `http://localhost:3000`

---

## 5. Partager le site depuis chez vous (amis / Internet)

Par défaut, `localhost` = **seulement votre PC**.

Pour que quelqu’un d’autre voie le site, il y a 2 approches.

### Approche 5A — La plus simple pour un non-informaticien : ngrok (recommandé pour tester)

**Idée :** un service gratuit/payant crée un tunnel temporaire.  
Vous gardez le site sur votre PC, et Internet peut y accéder via une adresse spéciale.

1. Faites d’abord tourner le site en local (`start.bat`) — section 4.
2. Créez un compte sur **https://ngrok.com/** (gratuit pour commencer).
3. Téléchargez ngrok pour Windows, décompressez-le.
4. Suivez leur guide « Get Started » (ils donnent une commande avec votre clé).
5. Lancez quelque chose du genre :

```text
ngrok http 3000
```

6. ngrok affiche une adresse HTTPS du style :

```text
https://abcd-12-34-56-78.ngrok-free.app
```

7. Envoyez **cette adresse** à vos amis.

**Limites importantes :**

- Votre PC doit rester **allumé**
- La fenêtre du site (`start.bat`) doit rester **ouverte**
- Sur le forfait gratuit, l’adresse change souvent à chaque redémarrage
- Ce n’est pas idéal pour un vrai site « officiel » 24 h / 24

Mais c’est parfait pour **montrer une démo**.

### Approche 5B — Ouvrir le port sur votre routeur (plus technique)

C’est ce qu’on appelle le **port forwarding** (redirection de port).

**En français simple :**  
Vous dites à votre modem/routeur (Bell, Vidéotron, etc.) :  
« Si quelqu’un d’Internet frappe à la porte **3000**, envoie-le à mon ordinateur. »

#### Pourquoi c’est plus difficile

- Chaque marque de modem a un menu différent
- Votre adresse Internet (IP publique) peut **changer**
- Votre box peut être en mode « CGNAT » (chez certains FAI) → ça bloque
- Il faut faire attention à la **sécurité** (votre PC devient visible d’Internet)

#### Grandes lignes (si vous insistez)

1. Sur votre PC, trouvez votre adresse locale :

```powershell
ipconfig
```

Cherchez `Adresse IPv4` (souvent `192.168.x.x`).

2. Connectez-vous à l’interface de votre routeur (souvent `http://192.168.1.1` ou `http://192.168.0.1`).  
   Identifiants : souvent sur une étiquette collée sous le modem.
3. Cherchez un menu nommé :
   - *Port Forwarding*
   - *Virtual Server*
   - *Redirection de ports*
   - *NAT*
4. Créez une règle :
   - Port externe : `3000`
   - Port interne : `3000`
   - IP interne : celle de votre PC (`192.168.x.x`)
   - Protocole : TCP
5. Depuis le téléphone en **4G/5G** (pas le Wi‑Fi de la maison), testez :

```text
http://VOTRE_IP_PUBLIQUE:3000
```

Pour trouver votre IP publique : allez sur Google et tapez `what is my ip`.

#### Et après ? Nom de domaine + redirection

Même si le port est ouvert, les gens ne veulent pas taper `http://74.12.34.56:3000`.

Vous pouvez :

1. Acheter un domaine (section 6)
2. Utiliser un service **DNS dynamique** (No-IP, DuckDNS, Cloudflare)  
   parce que l’IP de la maison change parfois
3. Pointer le domaine vers votre IP

**Honnêtement :** pour un site « officiel », **Azure (section 7) est plus simple et plus fiable** que le port forwarding maison.

---

## 6. Acheter un nom de domaine

### À quoi ça sert ?

Au lieu de :

```text
https://aventuriers-du-lys.azurewebsites.net
```

vos visiteurs tapent :

```text
https://aventuriersdlys.ca
```

### Où acheter ?

Exemples (tous corrects) :

- **https://www.namecheap.com/**
- **https://domains.google/**
- **https://www.ovhcloud.com/** (souvent pratique en français)
- **https://www.godaddy.com/**
- Chez certains fournisseurs Internet / Microsoft parfois aussi

Pour un `.ca`, il faut parfois une adresse au Canada (règles du registre canadien).

### Prix typique (estimation 2026)

| Type | Prix approximatif |
|------|-------------------|
| Domaine `.com` | **12 à 20 $ US / an** |
| Domaine `.ca` | **15 à 25 $ CAD / an** |
| Renouvellement | à peu près le même prix chaque année |

⚠️ Attention aux rabais « première année pas chère » : regardez le **prix de renouvellement**.

### Étapes générales (chez n’importe quel vendeur)

1. Cherchez si le nom est libre (ex. `aventuriersdlys.ca`).
2. Ajoutez-le au panier.
3. Créez un compte, payez.
4. Dans le panier, **refusez** les extras inutiles au début :
   - protection WHOIS payante (parfois incluse)
   - hébergement email cher
   - « site builder »
   - certificats vendus trop cher (Azure / Cloudflare peuvent gérer HTTPS)
5. Une fois acheté, allez dans la zone **DNS** du domaine.
6. Plus tard, vous créerez des enregistrements qui pointent vers Azure (section 7).

Vous n’avez **pas besoin** d’un domaine pour tester en localhost.

---

## 7. OPTION B — Héberger sur Azure (Microsoft)

**Idée simple :**  
Microsoft loue un petit ordinateur dans ses centres de données.  
Votre site y tourne **jour et nuit**, même si votre PC est éteint.

Durée estimée première mise en ligne : **1 à 3 heures** (surtout la première fois).  
Niveau : un peu plus long, mais une fois fait, peu d’entretien.

### 7.1 Créer un compte Azure

1. Allez sur **https://azure.microsoft.com/fr-fr/free/**
2. Cliquez pour créer un compte gratuit.
3. Il faut :
   - un courriel Microsoft (Outlook/Hotmail/Xbox… ou créez-en un)
   - une **carte de crédit** (même pour l’essai gratuit — Microsoft vérifie que vous êtes réel)
4. Lisez bien : l’essai gratuit donne souvent un crédit (ex. ~200 $) pour le premier mois, **puis** ça devient payant si vous laissez des services allumés.

💡 Activez aussi des **alertes de budget** (ex. « préviens-moi à 10 $ ») pour éviter les surprises.

### 7.2 Ce qu’on va créer (en langage simple)

| Élément Azure | Traduction humaine |
|---------------|--------------------|
| **Groupe de ressources** | Un tiroir qui contient tout le projet |
| **App Service Plan** | La « machine louée » (puissance + facture) |
| **Web App** | Le site lui-même |
| **Paramètres d’application** | Petits réglages secrets (mot de passe de session, etc.) |

Notre projet n’a **pas** besoin d’une grosse base SQL Azure :  
la base SQLite est un fichier dans l’application. C’est plus simple et moins cher.

### 7.3 Créer l’application (portail Azure)

1. Connectez-vous au portail : **https://portal.azure.com/**
2. En haut, cherchez **« Créer une ressource »** / *Create a resource*.
3. Cherchez **Web App** (Application Web).
4. Cliquez **Créer**.
5. Remplissez à peu près comme suit :

| Champ | Que mettre |
|-------|------------|
| Abonnement | Votre abonnement (Free Trial / Pay-As-You-Go) |
| Groupe de ressources | Créez-en un : `aventuriers-rg` |
| Nom | ex. `aventuriers-du-lys` (doit être unique sur Azure) |
| Publier | **Code** |
| Pile d’exécution | **Node 20 LTS** (ou Node 18 LTS si 20 n’apparaît pas) |
| Système d’exploitation | **Linux** (recommandé) |
| Région | **Canada Central** (si vous êtes au Québec) |
| Plan | Voir prix juste en dessous |

6. Cliquez **Vérifier + créer**, puis **Créer**.
7. Attendez 1–3 minutes. Bouton **Accéder à la ressource**.

### 7.4 Quel plan choisir ? (et combien ça coûte)

Estimations **approximatives** en dollars US, région typique.  
Les prix Azure changent ; vérifiez toujours le calculateur :  
https://azure.microsoft.com/pricing/calculator/

| Plan | Pour qui ? | Estimation / mois | Domaine perso | Commentaire |
|------|------------|-------------------|---------------|-------------|
| **Free F1** | Juste tester 1–2 jours | **0 $** | Non (limité) | Se met en veille, très limité. Pas pour la prod. |
| **Basic B1** | Petit site, quelques joueurs | **~13 à 18 $ US** (~18–25 $ CAD) | Oui | **Bon choix** pour démarrer |
| **Basic B2** | Un peu plus de marge | **~26 à 35 $ US** | Oui | Si B1 est juste |
| **Standard S1** | Plus sérieux / trafic | **~55 à 75 $ US** | Oui | Probablement trop pour votre besoin actuel |

**Pour Les Aventuriers du Lys (petit forum / groupes) : commencez en B1.**

Autres coûts possibles :

| Élément | Estimation |
|---------|------------|
| Trafic Internet sortant | souvent **quasi 0 $** au début (Microsoft donne un volume gratuit mensuel) |
| Nom de domaine | **15–25 $/an** (acheté ailleurs) |
| Certificat HTTPS | souvent **0 $** via Azure (Let’s Encrypt / certificat géré) sur plans payants |
| Support Microsoft payant | inutile au début |

**Budget réaliste « site en ligne + beau nom » :**  
environ **20–30 $ CAD / mois** + **~20 $ CAD / an** pour le domaine.

### 7.5 Réglages obligatoires de l’application

Dans votre Web App Azure :

1. Menu de gauche → **Paramètres** → **Variables d’environnement**  
   (parfois appelé *Configuration* / *Application settings*).
2. Ajoutez :

| Nom | Valeur | Explication |
|-----|--------|-------------|
| `SESSION_SECRET` | une longue phrase secrète au hasard | comme un cadenas pour les sessions de connexion |
| `NODE_ENV` | `production` | mode « vrai site » |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Azure installe les paquets `npm` au déploiement |

Exemple de `SESSION_SECRET` :

```text
Lys-2026-UneLonguePhraseSecreteQuePersonneNeDevine-!84kq
```

3. **Enregistrez**. Azure redémarre l’app.

4. Menu **Configuration** / **Général** : vérifiez que la commande de démarrage est :

```text
npm start
```

(Si le champ est vide, Azure utilise souvent le `package.json` — c’est bon aussi.)

### 7.6 Envoyer le code sur Azure (déploiement)

Voici la méthode la plus simple pour un débutant : **Zip Deploy** (envoyer un fichier zip).

#### Préparer le zip sur votre PC

1. Allez dans le dossier `Aventuriers-du-lys-app`.
2. Sélectionnez le **contenu** important :
   - `server`
   - `public`
   - `package.json`
   - `package-lock.json` (s’il existe)
   - `.env.example`
   - `README.md` (optionnel)
3. **N’incluez pas** obligatoirement :
   - `node_modules` (Azure le reconstruira)
   - `data\app.db` (sauf si vous voulez migrer des données existantes)
4. Clic droit → **Compresser vers une archive ZIP**  
   (ou utilisez 7-Zip).

⚠️ Le `package.json` doit être **à la racine** du zip (pas dans un sous-dossier).

#### Envoyer le zip

1. Dans Azure, ouvrez votre Web App.
2. Cherchez **Outils avancés** (*Advanced Tools*) → **Accéder** (Kudu).
3. Ou utilisez **Déploiement** → **Centre de déploiement**.
4. Méthode simple : extension VS Code « Azure App Service », ou commande Azure :

Si vous avez installé [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) :

```powershell
az login
az webapp deploy --resource-group aventuriers-rg --name aventuriers-du-lys --src-path "C:\chemin\vers\site.zip" --type zip
```

(Adaptez les noms.)

#### Autre méthode plus propre (plus tard)

Connecter Azure à **GitHub** : chaque fois que vous poussez du code, Azure met à jour le site.  
Utile si quelqu’un d’un peu tech vous aide une fois.

### 7.7 Vérifier que le site Azure répond

1. Dans Azure, page de votre Web App, cliquez sur l’URL du type :

```text
https://aventuriers-du-lys.azurewebsites.net
```

2. Le site doit s’afficher.
3. Créez un compte test, publiez une partie, réservez.

Si ça ne charge pas : menu **Journal** / *Log stream* pour voir les erreurs, ou section 10.

### 7.8 Brancher votre nom de domaine sur Azure

Quand votre domaine est acheté (section 6) :

1. Dans Azure Web App → **Domaines personnalisés** / *Custom domains*.
2. Ajoutez `aventuriersdlys.ca` (exemple).
3. Azure vous demande de prouver que le domaine est à vous, via DNS :
   - souvent un enregistrement **TXT**
   - puis un enregistrement **CNAME** ou **A**
4. Chez votre vendeur de domaine (OVH, Namecheap…), ouvrez **DNS** et créez exactement ce qu’Azure demande.
5. Attendez (parfois **5 minutes**, parfois **quelques heures**).
6. Ensuite activez **HTTPS** (certificat gratuit géré par Azure, sur plan payant).

Résultat final :

```text
https://aventuriersdlys.ca
```

### 7.9 Attention : données et redémarrages sur Azure

Le fichier SQLite (`data/app.db`) vit sur le disque de l’App Service.

- Pour un **petit** usage, ça peut suffire.
- Si vous recréez l’app from scratch, vous pouvez perdre des données → **sauvegardez** (section 9).
- Plus tard (si le site grandit), on pourra déplacer la base vers un stockage Azure plus durable. Pas nécessaire le jour 1.

---

## 8. Comparer les coûts (estimation)

Montants **approximatifs**, en date de rédaction. Toujours vérifier avant de payer.

### Scénario 1 — Chez soi seulement

| Poste | Coût |
|-------|------|
| Node.js | 0 $ |
| Application | 0 $ |
| Électricité PC | négligeable |
| **Total** | **0 $ / mois** |

Limite : le site n’est public que si votre PC est allumé (+ ngrok / ports).

### Scénario 2 — Démo Internet temporaire (ngrok)

| Poste | Coût |
|-------|------|
| Localhost | 0 $ |
| ngrok gratuit | 0 $ (limites) |
| ngrok payant (option) | ~8–10 $ US / mois |
| **Total** | **0 à 10 $ / mois** |

### Scénario 3 — Vrai site sur Azure (recommandé pour la durée)

| Poste | Estimation |
|-------|------------|
| Azure App Service **B1** | ~13–18 $ US / mois (~18–25 $ CAD) |
| Nom de domaine `.ca` / `.com` | ~15–25 $ / **an** |
| HTTPS | 0 $ (inclus sur plan payant typique) |
| Base SQL Azure séparée | **non nécessaire** au début |
| **Total démarrage** | **environ 20–30 $ CAD / mois** + domaine annuel |

### Scénario 4 — Trop cher / inutile au début

| Poste | Pourquoi éviter |
|-------|-----------------|
| Plan Standard S1 tout de suite | trop puissant pour quelques utilisateurs |
| Base MySQL/Postgres managée | +30–100 $/mois sans besoin réel ici |
| Machines virtuelles complètes | plus de maintenance |

---

## 9. Sauvegarder vos données (très important)

Vos membres, parties et réservations sont dans :

```text
Aventuriers-du-lys-app\data\app.db
```

### Sur PC (localhost)

1. Arrêtez le site (fermez la fenêtre noire) — idéalement.
2. Copiez `data\app.db` vers :
   - une clé USB
   - OneDrive / Google Drive
   - un dossier `Sauvegardes\aventuriers-2026-08-10\`
3. Remettez le site en marche.

Faites ça **une fois par semaine** si des gens utilisent vraiment le site.

### Sur Azure

1. Utilisez **Advanced Tools (Kudu)** → parcourir les fichiers.
2. Téléchargez `data/app.db`.
3. Ou branchez un stockage Azure plus tard (demandez de l’aide tech si besoin).

**Règle d’or :** si vous n’avez qu’une seule copie, vous n’avez pas de sauvegarde.

---

## 10. Problèmes fréquents

### « node n’est pas reconnu… »
- Fermez PowerShell, rouvrez-le.
- Sinon redémarrez Windows.
- Sinon réinstallez Node.js (version **LTS**).

### `npm install` affiche une erreur rouge
- Vérifiez votre Internet.
- Relancez la commande.
- Si ça parle de `better-sqlite3` / compilation : installez les outils de build quand l’installateur Node le propose, ou demandez de l’aide (c’est le point le plus technique).

### La page localhost ne charge pas
- Vérifiez que la fenêtre noire est encore ouverte.
- Vérifiez l’adresse : `http://localhost:3000` (pas `https`).
- Essayez `http://127.0.0.1:3000`.

### « Ce site est inaccessible » pour un ami
- En localhost pur, c’est normal : lui n’est pas sur votre PC.
- Utilisez ngrok (section 5) ou Azure (section 7).

### Port 3000 déjà utilisé
Un autre programme utilise déjà l’appartement 3000.

Solution simple : dans le fichier `.env`, changez :

```text
PORT=3001
```

Puis ouvrez `http://localhost:3001`.

### J’ai oublié mon mot de passe admin
Les comptes démo sont plus bas.  
Sinon : restaurez une sauvegarde de `app.db`, ou demandez à la personne tech de réinitialiser un compte.

### Azure affiche une page d’erreur
- Vérifiez que `npm start` fonctionne **chez vous** d’abord.
- Vérifiez les variables `SESSION_SECRET` et `NODE_ENV`.
- Regardez **Log stream** dans Azure.
- Vérifiez que le zip avait `package.json` à la racine.

### Le site Azure « s’endort »
Sur le plan **Free**, oui. Passez au **B1** pour un vrai usage.

---

## 11. Comptes de démonstration

Au premier démarrage, le site crée automatiquement :

| Courriel | Mot de passe | Rôle |
|----------|--------------|------|
| `admin@aventuriers.local` | `demo1234` | Admin |
| `mj@aventuriers.local` | `demo1234` | Maître de jeu |

⚠️ Changez ces mots de passe (ou créez vos vrais comptes) avant d’ouvrir le site au public.

---

## Mini-checklist « je suis rendu »

### Sur mon PC
- [ ] Node.js LTS installé (`node -v` fonctionne)
- [ ] Dossier `Aventuriers-du-lys-app` présent
- [ ] `start.bat` lancé sans fermer la fenêtre
- [ ] `http://localhost:3000` affiche le site
- [ ] Je peux créer un compte et réserver

### Sur Internet (Azure)
- [ ] Compte Azure créé + alerte budget
- [ ] Web App Node Linux créée (idéalement Canada Central)
- [ ] Plan B1 (ou Free pour test très court)
- [ ] Variables `SESSION_SECRET` + `NODE_ENV=production`
- [ ] Code déployé
- [ ] URL `*.azurewebsites.net` fonctionne
- [ ] (Option) Domaine acheté + branché + HTTPS
- [ ] Sauvegarde de `app.db` faite

---

## Besoin d’aide humaine ?

Si vous bloquez, envoyez à la personne qui vous aide **ces 4 infos** :

1. À quelle étape du guide vous êtes (ex. « A5 »)
2. Une capture d’écran de l’erreur
3. Le résultat de `node -v` et `npm -v`
4. Est-ce que vous êtes en localhost ou sur Azure

---

## Résumé ultra-court

1. Installez **Node.js LTS** depuis https://nodejs.org/  
2. Double-cliquez **`scripts\start.bat`**  
3. Ouvrez **http://localhost:3000**  
4. Quand vous êtes prêt pour le public : louez **Azure App Service B1** (~20–30 $ CAD/mois)  
5. (Option) Achetez un **domaine** (~20 $/an) et branchez-le  
6. Sauvegardez régulièrement **`data\app.db`**

C’est tout. Le reste, c’est du détail — et le détail est plus haut, étape par étape.
