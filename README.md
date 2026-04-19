# Big Mahmoud — v6

## Stack
- **Vite** + **TypeScript**
- **Firebase** (Auth + Firestore)
- **5 langues** : FR, EN, AR, ZH, KO

## Installation

```bash
npm install
npm run dev      # développement local
npm run build    # build production → dossier dist/
```

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` déploie automatiquement à chaque push sur `main`.

**Étapes une seule fois :**
1. GitHub → Settings → Pages → Source : **GitHub Actions**
2. Push sur `main` → déploiement automatique

## Structure

```
src/
├── config.ts      # Numéros de téléphone, config Firebase
├── firebase.ts    # Singleton Firebase
├── i18n.ts        # 5 langues complètes
├── main.ts        # Animations, CMS lecture, boot
├── reservation.ts # Formulaire de réservation
└── admin.ts       # Panel admin complet
```

## Admin Panel — `/admin.html`

- **Réservations** : voir, confirmer, annuler, supprimer
- **Contenu du site** : modifier textes, image hero, ordre des sections
- **Mot de passe** : changer depuis le panel (nécessite mot de passe actuel)
- **Bouton "Site public"** : retour direct à index.html

## Changer les numéros

Modifie `src/config.ts` :
```ts
WA_NUMBER:     '21621006219',  // WhatsApp (inchangé)
PHONE_NUMBER:  '+21626740303', // Téléphone affiché
PHONE_DISPLAY: '+216 26 740 303',
```
