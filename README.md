[Jira](http://jira.msp.gouv.qc.ca/secure/RapidBoard.jspa?projectKey=MIGO2&rapidView=721) • [Test](https://testgeoegl.msp.gouv.qc.ca/igo2/portail/) • [Preprod](https://pregeoegl.msp.gouv.qc.ca/igo2/portail/) • [Prod](https://geoegl.msp.gouv.qc.ca/igo2/portail/)

# API pour le Geoportail du MSP (igo2)
L'API de igo2 est basé sur la librairie @igo2/base-api. Plusieurs fonctionnalités et comportements sont controllés dans le base-api.


## Contenu

| Section | Description |
| ------- | ----------- |
| [🚧 Requis](#-requis) | Dépendances requises |
| [📜 Commandes npm](#-commandes-npm) | Commandes npm disponible |
| [💾 Démarrage](#-démarrage) | Étapes pour démarrer le projet |
| [🌎 Contribution](#-contribution) | Explication minimale du flow de développement |
| [🧰 Dépannage](#-dépannage) | Liste des problèmes possible avec solution pour chaque |


## 🚧 Requis
- [Git]
- [Node.js] >= 16.14 qui inclus le [Node Package Manager][npm]
- Les extensions Eslint, Prettier dans votre IDE 
- [Docker] et pour Windows [WSL 2]


## 📜 Commandes NPM

| Commande| Description |
| -------- | ----------- |
| `start` | Démarrer l'API en mode Watch sur les fichiers Typescript. Ce mode de développement en LOCAL nécessite que le Docker pour l'infrastructure est monté. (DevContainer) |
| `start.dev` | Démarrer l'API, connecté à l'environnement de TEST/DEV en mode Watch sur les fichiers Typescript. |
| `build.prod` | Compiler en Javascript |
| `serve.prod` | Démarrer l'API en mode compilé  |
| `lint` | Analyser les erreurs syntaxiques et les règles de styles pour le code |
| `test` | Permet de rouler la suite de test  |


## 💾 Démarrage
Pour démarrer l'application en local on doit préalablement préparer l'infrastructure.

### Infrastructure
Il est conseillé de développer directement dans le DevContainer. Notez que la base de donnée doit être manuellement populé avec un replica, demandé à un administrateur du projet de vous fournir le replica.

#### DevContainer
Assurez-vous que votre éditeur de code supporte les DevContainer (VsCode/IntelliJ). Dans VsCode, il y a plusieurs moyen d'ouvrir le DevContainer, via le raccourci du clavier: `ctrl + shift + p` et sélectionner le menu `Dev Containers: Reopen in Container` ou une des variantes pour le builder.

#### Docker Compose
Vous pouvez aussi lancer directement le docker compose qui se situe dans le dossier `.devcontainer`.

### Démarrer l'application
Lancer le `npm run start`.


## 🌎 Contribution

1. Prendre/assigner une sous-tâche Jira en priorité avant une nouvelle story.
2. Mettre cette sous-tâche/story en « In progress ».
3. Ensuite:
   1. Si nouvelle story, faire un kickoff technique avec le tech lead, l’architecte associé et désigneur si nécessaire.
   2. Pour une sous-tâche, simplement aviser la personne associée à la story liée.
4. Faire ce qui est demandé dans la story/sous-tâche.
5. Créer une MR sur GitLab avec une description la plus claire possible avec des screenshots/vidéos si changement visuel.
6. Mettre la story/sous-tâche en « Code review » dans Jira.
7. Une fois approuvé, merger la MR. Si la tâche faite est une sous-tâche, simplement la mettre à « Done » dans Jira. Sinon, mettre la story à « QA » dans Jira.
8. Si nouvelle story, faire la validation sur la DEV de ce qui a été fait et mettre en « Under review » dans Jira.


## 🧰 Dépannage

- DevContainer - Registre Docker bloqué par le VPN? Fermé votre VPN et relancer le build du DevContainer. Une fois les images Docker téléchargé vous n'aurez plus le problème pour la réouverture.


[git]: https://git-scm.com/
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[Docker]: https://www.docker.com/
[WSL 2]: https://learn.microsoft.com/en-us/windows/wsl/about
