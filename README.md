# API pour Infrastructure géomatique ouverte 2.0 (IGO2) / API for IGO 2.0
***

### Qu'est-ce qu'IGO?
IGO2 est une solution Web gratuite en géomatique basée sur [Angular 2](https://github.com/angular/angular) et [OpenLayers 3](https://github.com/openlayers/ol3).
IGO2 permet de tirer profit d’une multitude de données géographiques grâce à une interface cartographique accessible par un navigateur Web sur un poste de travail et par un appareil mobile.
IGO2 a été initié par l'administration publique du Québec (Canada) et issu d’un travail collaboratif basé sur la philosophie des logiciels libres et ouverts (« open source »). Les membres du public en géomatique et du Web qui soumettent des contributions conservent leurs droits d'auteur s'ils partagent leur code source selon la [LICENCE LiLiQ-R de type LGPL](LICENCE.txt).


***
### What is IGO?
IGO2 (for Open GIS Infrastructure - version 2.0) is a free open source Web Geospatial solution developed at first in Quebec, Canada based on [Angular 2](https://github.com/angular/angular) and [OpenLayers 3](https://github.com/openlayers/ol3).
IGO2 is having multiple features, such as Web GIS viewer adapted to Desktop and Mobile and many more available at [http://igo2.readthedocs.io/fr/latest/english.html](http://igo2.readthedocs.io/fr/latest/english.html). Since this project is open source, anyone can contribute as long as they share their work on the same open source [LICENCE LGPL-Style](LICENSE_ENGLISH.txt). All contributors in IGO keep their property rights.
***

---
## Table des matières (Français)

- [Installation](#installation-et-démarrage)
- [Tests](#tests)
- [Contribuer](#contribuer)


***

---
## Table of content (English)

- [Installation](#installation-en)
- [Tests](#tests-en)
- [Contribute](#contribution)

***

## Installation et démarrage (Français)

Requis: node >=v6.5.0 et npm >=3.10.3

```bash
$ git clone --depth 1 https://github.com/infra-geo-ouverte/igo2-api.git
$ cd igo2-api

# Installer les dépendances
$ npm install

# Surveiller les fichiers et lancer une instance pour le développement
$ npm start
# Ouvrir un navigateur http://localhost:5000/

# Build dev
$ npm run build.dev
$ npm run serve.dev
# Ouvrir un navigateur http://localhost:5000/

# Build prod
$ npm run build.prod
$ npm run serve.prod
# Ouvrir un navigateur http://localhost:5000/

# Ouvrir la documentation
# Ouvrir un navigateur http://localhost:5000/docs
```

## Tests

```bash
$ npm test

# code coverage (istanbul)
$ npm run coverage

```

***
## Contribuer
Nous sommes bien heureux que vous pensiez contribuer à IGO! Avant de le faire, nous vous encourageons à lire le guide de [contribution](.github/CONTRIBUTING.md), la [LICENCE](LICENCE.txt) et le [WIKI](https://github.com/infra-geo-ouverte/igo2-api/wiki). Si vous avez d'autres questions, n'hésitez pas à communiquer avec nous à l'adresse suivante : info(a)igouverte.org.

***

***

## Installation-en

Require: node >=v6.5.0 & npm >=3.10.3

```bash
$ git clone https://github.com/infra-geo-ouverte/igo2-api.git
$ cd igo2-api

# Install dépendencies
$ npm install

# Check files and launch dev instance
$ npm start
# Open your browser at http://localhost:5000/

# Build dev
$ npm run build.dev
$ npm run serve.dev
# Open your browser at http://localhost:5000/

# Build prod
$ npm run build.prod
$ npm run serve.prod
# Open your browser at http://localhost:5000/

# Doc API
# Open your browser at http://localhost:5000/docs

```

## Tests-en


```bash
$ npm test

# code coverage (istanbul)
$ npm run coverage
```
***

## Contribution
Before contributing, please read the [guidelines](.github/CONTRIBUTING.md), the [LICENCE](LICENSE_ENGLISH.txt) and the [WIKI](https://github.com/infra-geo-ouverte/igo2-api/wiki). If you have any question and want to contribute, contact the main email of IGO: info(a)igouverte.org.
