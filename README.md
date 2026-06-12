# IGO API

L'API IGO centralise la gestion des contextes, la configuration des couches géographiques, les profils utilisateurs, les points d'intérêt (POI) et les catalogues.

## Contenu

| Section                                               | Description                                            |
| ----------------------------------------------------- | ------------------------------------------------------ |
| [🚧 Prérequis](#-prérequis)                           | Dépendances et programmes requis                       |
| [🎓 Préparation du projet](#-préparation-du-projet)   | Comment préparer le projet initialement                |
| [📜 Commandes NPM](#-commandes-npm)                   | Commandes NPM disponibles pour le développement        |
| [💾 Démarrage](#-démarrage)                           | Étapes pour démarrer le projet                         |
| [🔒 Architecture](#-architecture)                     | Architecture du projet                                 |
| [🌎 Contribution](#-contribution)                     | Explication minimale du processus de développement     |
| [🧰 Dépannage](#-dépannage)                           | Liste des problèmes possibles                          |

## 🚧 Prérequis

- [Git]
- [Node.js] >= 22 qui inclus le [Node Package Manager][npm]
- IDE: VS Code (ou autre) avec extensions Dev Containers, ESLint et Prettier
- [Docker] et [WSL 2] pour Windows

## 🎓 Préparation du projet

Pour une expérience optimale, il est fortement recommandé d'utiliser WSL2 couplé aux Dev Containers. Cette approche automatise l'installation des dépendances, garantit un environnement identique pour tous les développeurs et facilite grandement la prise en main du projet.

Dans l'IDE, vous pouvez ouvrir le projet dans un Dev Container en faisant `Ctrl+Shift+P` et en sélectionnant `Dev Containers: Reopen in Container`. À la première ouverture du projet, le Dev Container sera monté.

## 📜 Commandes NPM

| Commande                   | Description                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start`                | Démarrer l'API en mode Watch sur les fichiers Typescript. Ce mode de développement en LOCAL nécessite que le Dev Container soit monté.        |
| `npm run build`            | Compiler le projet en Javascript.                                                                                                              |
| `npm run lint`             | Analyser les erreurs syntaxiques et les règles de styles pour le code.                                                                         |
| `npm run format`           | Analyser le formattage du code.                                                                                                                |
| `npm run types`            | Analyser la syntaxe du code Typescript.                                                                                                         |
| `npm run test`             | Rouler la suite de tests.                                                                                                                      |
| `npm run e2e`              | Lancer les tests End-to-End (E2E). (Attention : Efface les données locales).                                                                   |
| `npm run e2e:ci`           | Exécuter les tests E2E dans un conteneur isolé (préserve votre BD locale).                                                                     |
| `npm run database:restore` | Restaurer la base de données locale du Dev Container.                                                                                          |

## 💾 Démarrage

1. Infrastructure

   Il est fortement conseillé de développer directement dans le Dev Container.
   - Docker Compose : Si vous n'utilisez pas les Dev Containers, les fichiers de configuration se trouvent dans le dossier `.devcontainer`.

2. Lancer l'application
   - Via l'IDE : Dans l'onglet "Run and Debug", sélectionner la configuration "Start API".
   - Via le terminal : Exécuter `npm run start`.

## 🔒 Architecture

L'API IGO est conçue comme un socle modulaire. Elle délègue les responsabilités d'authentification et d'autorisation spécialisée à des modules extensibles.

### 🔑 Authentification

L'authentification est centralisée via le `authenticationPlugin` qui gère deux aspects :

1. **API (`api`)** : Le service responsable de la résolution de l'identité de l'utilisateur (ex: `AuthenticationApi` s'interfaçant avec `AUTH_API`).
2. **Stratégie (`strategy`)** : Le plugin Fastify (ex: `headerAuthentication`) qui intercepte les requêtes pour en extraire l'identité (Headers HTTP via une passerelle comme KONG).

Ce module injecte l'objet `request.user` dans le contexte de chaque requête.

```typescript
// Enregistrement de l'authentification unifiée dans app.ts
await app.register(authenticationPlugin, {
  api: { authApi: AuthenticationApi, userService: UserService },
  strategy: {
    plugin: headerAuthentication,
    options: {
      clients: [
        { client: LayerWssClient, options: { withAuthorization: true } },
        { client: AuthClient, options: { withApiKey: true } },
        { client: PermissionClient, options: { withApiKey: true } }
      ]
    }
  }
});
```

### 🛡️ Autorisation

L'autorisation dans l'API s'appuie sur les **profils** (groupes) de l'utilisateur injectés dans `request.user.profils` lors de l'authentification.

- **Identité centrale :** Chaque module de l'API utilise ces profils pour déterminer les droits d'accès (Lecture/Écriture).
- **Consistance :** Les permissions sont ainsi gérées de manière centralisée et propagée à travers les services internes.

### 🗺️ Layer Permission (Optionnel)

Pour la gestion fine des couches géographiques (GIS), l'API propose un module de gestion de permissions optionnel.

- **Rôle :** Vérifier si un utilisateur a le droit de visualiser ou d'interroger une couche OGC spécifique en fonction de son URL.
- **Implementation Kong :** Le projet fournit `LayerPermissionKongApi` qui interroge l'API de KONG pour valider les ACLs du service sous-jacent.
- **Modularité :** Ce module est enregistré uniquement si nécessaire dans `app.ts` :

```typescript
await app.register(layerPermissionPlugin, {
  implementation: LayerPermissionKongApi
});
```

### ⚙️ Variables d'environnement requises

Copiez d'abord le fichier `.env.example` et renommez-le `.env`.

Assurez-vous que votre fichier `.env` contient la configuration suivante pour ces modules :

- `AUTH_API` : Point de terminaison du service d'authentification.
- `KONG_API` : (Si `LayerPermissionKongApi` est utilisé) URL d'administration de la passerelle.
- `OGC_WSS_HOSTS` / `OGC_WSS_BASE_PATHS` : Configuration des hôtes protégés.

## 🌎 Contribution

1. Prendre/assigner une sous-tâche Github en priorité avant un nouveau récit.
2. Mettre cette sous-tâche/ce récit à « En cours ».
3. Ensuite:
   1. Pour un récit, faire un kickoff technique avec le tech lead, l’architecte associé et désigneur si nécessaire.
   2. Pour une sous-tâche, simplement aviser la personne associée au récit liée.
4. Faire ce qui est demandé dans le récit/la sous-tâche.
5. Créer une MR sur GitHub avec une description la plus claire possible avec des screenshots/vidéos s'il y a changement visuel.
6. Mettre le récit/la sous-tâche à « En revue » dans Github.
7. Une fois approuvée, merger la MR. Si la tâche faite est une sous-tâche, simplement la mettre à « Terminé » dans Github. Sinon, mettre le récit à « En essai » dans Github et faire la validation sur la DEV.
8. Une fois la validation terminée, mettre le récit à « Terminé » dans Github.

## 🧰 Dépannage

- Dev Containers - Le registre Docker est bloqué par le VPN? Arrêtez votre VPN et relancer le build du Dev Container. Une fois les images Docker téléchargées vous n'aurez plus le problème pour la réouverture.

[git]: https://git-scm.com/
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[Docker]: https://www.docker.com/
[WSL 2]: https://learn.microsoft.com/en-us/windows/wsl/about
