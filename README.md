# IGO API

L'API IGO centralise la gestion des contextes, la configuration des couches géographiques, les profils utilisateurs, les points d'intérêt (POI) et les catalogues.

## Contenu

| Section                                 | Description                                            |
| --------------------------------------- | ------------------------------------------------------ |
| [🚧 Requis](#-requis)                   | Dépendances requises                                   |
| [🎓 Setup du projet](#-setup-du-projet) | Comment setuper le projet initialement                 |
| [📜 Commandes](#-commandes-npm)         | Commandes disponible                                   |
| [💾 Démarrage](#-démarrage)             | Étapes pour démarrer le projet                         |
| [🔒 Architecture](#-architecture)       | Architecture du projet                                 |
| [🌎 Contribution](#-contribution)       | Explication minimale du flow de développement          |
| [🧰 Dépannage](#-dépannage)             | Liste des problèmes possible avec solution pour chaque |

## 🚧 Requis

- [Git]
- [Node.js] >= 22 qui inclus le [Node Package Manager][npm]
- IDE: VS Code ou autres avec extensions Eslint, Prettier dans votre IDE
- [Docker] et WSL pour Windows [WSL 2]

## 🎓 Setup du projet

Pour une expérience optimale, nous préconisons l'utilisation de WSL (sur Windows) couplé aux DevContainers. Cette approche automatise l'installation des dépendances, garantit un environnement identique pour tous les développeurs et facilite grandement la prise en main du projet.


## 📜 Commandes NPM

| Commande           | Description                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `npm start`        | Démarrer l'API en mode Watch sur les fichiers Typescript. Ce mode de développement en LOCAL nécessite que le DevContainer soit monté. |
| `npm run build`    | Compiler en Javascript                                                                                                                |
| `npm run lint`     | Analyser les erreurs syntaxiques et les règles de styles pour le code                                                                 |
| `npm run format`   | Analyser le formattage du code                                                                                                        |
| `npm run types`    | Analyser la syntaxe du code Typescript                                                                                                |
| `npm run test`     | Permet de rouler la suite de test                                                                                                     |
| `npm run e2e`      | Lance les tests End-to-End (E2E). Attention : Efface les données locales                                                              |
| `npm run e2e:ci`   | Exécute les tests E2E dans un conteneur isolé (préserve votre BD locale)                                                              |
| `database:restore` | Restaure la base de données locale du DevContainer                                                                                    |     |

## 💾 Démarrage

1. Infrastructure

   Il est fortement conseillé de développer directement dans le DevContainer.
   - Docker Compose : Si vous n'utilisez pas les DevContainers, les fichiers de configuration se trouvent dans le dossier .devcontainer.

2. Lancer l'application
   - Via l'IDE : Dans l'onglet "Run and Debug", sélectionnez la configuration "Start api".

   - Via le terminal : Exécutez npm run start.

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
  api: { implementation: AuthenticationApi },
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

Assurez-vous que votre fichier `.env` contient la configuration suivante pour ces modules :

- `AUTH_API` : Point de terminaison du service d'authentification.
- `KONG_API` : (Si `LayerPermissionKongApi` est utilisé) URL d'administration de la passerelle.
- `OGC_WSS_HOSTS` / `OGC_WSS_BASE_PATHS` : Configuration des hôtes protégés.

## 🌎 Contribution

1. Prendre/assigner une sous-tâche Jira en priorité avant une nouvelle story.
2. Mettre cette sous-tâche/story en « In progress ».
3. Ensuite:
   1. Si nouvelle story, faire un kickoff technique avec le tech lead, l’architecte associé et désigneur si nécessaire.
   2. Pour une sous-tâche, simplement aviser la personne associée à la story liée.
4. Faire ce qui est demandé dans la story/sous-tâche.
5. Créer une MR sur Github avec une description la plus claire possible avec des screenshots/vidéos si changement visuel.
6. Mettre la story/sous-tâche en « Code review » dans Jira.
7. Une fois approuvé, merger la MR. Si la tâche faite est une sous-tâche, simplement la mettre à « Done » dans Jira. Sinon, mettre la story à « QA » dans Jira.
8. Si nouvelle story, faire la validation sur la DEV de ce qui a été fait et mettre en « Under review » dans Jira.

## 🧰 Dépannage

- DevContainer - Registre Docker bloqué par le VPN? Fermer votre VPN et relancer le build du DevContainer. Une fois les images Docker téléchargé vous n'aurez plus le problème pour la réouverture.

[git]: https://git-scm.com/
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[Docker]: https://www.docker.com/
[WSL 2]: https://learn.microsoft.com/en-us/windows/wsl/about
