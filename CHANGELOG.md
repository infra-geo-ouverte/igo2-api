## [1.7.1](https://github.com/infra-geo-ouverte/igo2-api/compare/0.0.1...1.7.1) (2022-12-14)


### Bug Fixes

* **context:** long uri for share context ([faa7e48](https://github.com/infra-geo-ouverte/igo2-api/commit/faa7e48ff80c8e6ee4479ae26d6af4d7b438c61b))
* **profiligo:** now possible to find accented name ([8f203cd](https://github.com/infra-geo-ouverte/igo2-api/commit/8f203cdce388ac826beafe27d5618e69f1f84f52))
* **script:** init DB script ([af45c8b](https://github.com/infra-geo-ouverte/igo2-api/commit/af45c8b254909061110e9b33918c6e8259a58b3a))


### Features

* **layer.service:** option to disable get capabilities request ([05d83a1](https://github.com/infra-geo-ouverte/igo2-api/commit/05d83a1bf8cfe38a76663bf3484e121df9f61ce8))



## [0.0.1](https://github.com/infra-geo-ouverte/igo2-api/compare/e66a7488c77336578f2da8865f58b53e957f5bd9...0.0.1) (2019-07-11)


### Bug Fixes

* **config:** add missing file ([0d09a8b](https://github.com/infra-geo-ouverte/igo2-api/commit/0d09a8b37fe91f8a4f07b0c6ec9bfafc686f1028))
* **context:** fix bug if layers is a empty array ([c252c33](https://github.com/infra-geo-ouverte/igo2-api/commit/c252c33636914b3c73caeecfa82c76ff2dcb29fd))
* **context:** fix bug if layers is a empty array ([dcbc3e4](https://github.com/infra-geo-ouverte/igo2-api/commit/dcbc3e46b032e53f5181e16d90f613ec3a56f97e))
* **context:** fix context default ([9da5617](https://github.com/infra-geo-ouverte/igo2-api/commit/9da561778292858f78c34534733ed583c3581d19))
* **context:** get default context error ([8c9419c](https://github.com/infra-geo-ouverte/igo2-api/commit/8c9419c3e126870fc37a2c06a48d9311e1241b77))
* **context:** must be authenticated to clone context ([aa8005a](https://github.com/infra-geo-ouverte/igo2-api/commit/aa8005a3f9ab5ce05c9077cff707148a0117a24f))
* **context:** uri must be unique ([88e5843](https://github.com/infra-geo-ouverte/igo2-api/commit/88e584310e0cb0b88b5099e367bd83610c1f07e3))
* **layer:** fix if layer is invalid in context ([45e601c](https://github.com/infra-geo-ouverte/igo2-api/commit/45e601c8bf97747f6ce579b3cad6243306c92fd4))
* **layer:** fix missing ; ([574cde6](https://github.com/infra-geo-ouverte/igo2-api/commit/574cde6d80c1643eb169f5cf6edcc59e33a9671a))
* **layer:** getBySource url ([9099f57](https://github.com/infra-geo-ouverte/igo2-api/commit/9099f57cbc1185ff28155013e2202bfc782399a4))
* **permission:** fix bulkcreate returns null value for primary key ([d7e4257](https://github.com/infra-geo-ouverte/igo2-api/commit/d7e425774a938d21b824ca3d7967453e8042dcd8))
* **user:** catch invalid username ([37b9f0a](https://github.com/infra-geo-ouverte/igo2-api/commit/37b9f0add70a0fb9dff15bd3c2c9c9dafbf0c258))
* **user:** fix groups (grapp) research ([b2af064](https://github.com/infra-geo-ouverte/igo2-api/commit/b2af06484670cf9f176fd26b76349a1c25db7bae))
* **user:** fix social auth ([43ea63d](https://github.com/infra-geo-ouverte/igo2-api/commit/43ea63d105e518851ce7f179f145f1023b8c4fe7))
* **user:** username always in lower case ([db8e8fc](https://github.com/infra-geo-ouverte/igo2-api/commit/db8e8fce2cb5c66bb042dbbd233b1d45567d9764))


### Features

* add parameters to schema ([a2cbd30](https://github.com/infra-geo-ouverte/igo2-api/commit/a2cbd3053fd54e07d7d92dff94389d289fefaed8))
* add parameters to schema ([989d033](https://github.com/infra-geo-ouverte/igo2-api/commit/989d03319a1a4df344520f4fb5aec4961127108c))
* **auth:** connect to many ldap ([5771fa7](https://github.com/infra-geo-ouverte/igo2-api/commit/5771fa78d00cf8c36a4a4a4ced30840a81f5025f))
* **catalog:** add catalog and secure wms url ([1c5d473](https://github.com/infra-geo-ouverte/igo2-api/commit/1c5d473e2e49da49f9779175f1b66156845ddb69))
* **context:** add context ([e66a748](https://github.com/infra-geo-ouverte/igo2-api/commit/e66a7488c77336578f2da8865f58b53e957f5bd9))
* **context:** add context details ([c110e81](https://github.com/infra-geo-ouverte/igo2-api/commit/c110e81cc115a8c9cfee463ae9e951dc904836bc))
* **context:** add properties ([7a5127a](https://github.com/infra-geo-ouverte/igo2-api/commit/7a5127a8dceb6953f8043d055456ec55da56054b))
* **contextDetails:** merge informations ([1256d8e](https://github.com/infra-geo-ouverte/igo2-api/commit/1256d8ee7ff58de1bf59f2a56b8034da91fd06e6))
* **context:** get context by uri and only admin can set context to public ([c92cbd3](https://github.com/infra-geo-ouverte/igo2-api/commit/c92cbd3e50f8ee7bf424f3e4eb1dfa9da727755a))
* **context:** valid that scope is public, protected or private ([c80c214](https://github.com/infra-geo-ouverte/igo2-api/commit/c80c214446def666a26d0c0a283e08efda6729f3))
* **db:** add postgres connection ([fec92bc](https://github.com/infra-geo-ouverte/igo2-api/commit/fec92bc315a1733d5430d4b65ff6207c96be2be6))
* **filter:** Adding ogcfilters, sourcefields, wms layer with wfssource & download ([#5](https://github.com/infra-geo-ouverte/igo2-api/issues/5)) ([5d9b21c](https://github.com/infra-geo-ouverte/igo2-api/commit/5d9b21c72b8716414bd666c3abb9388b937e6489))
* **layer:** add layer feature ([6348543](https://github.com/infra-geo-ouverte/igo2-api/commit/63485434d08316f49259f441d1fd4a6b244ce259))
* **layer:** add options to layer ([b06e763](https://github.com/infra-geo-ouverte/igo2-api/commit/b06e763b7925e63fcf2d254acaa9223b24bf672b))
* **layer:** add route to get baselayers ([7ca591c](https://github.com/infra-geo-ouverte/igo2-api/commit/7ca591cf9d0f87e5bc67c3fd61eca3d888cd77c1))
* **layerContext:** add link layer and context ([ceaa253](https://github.com/infra-geo-ouverte/igo2-api/commit/ceaa2536fabfa69ce2a2a013d95d9ef4b8315b9e))
* **layerContext:** link layer and context ([48cb954](https://github.com/infra-geo-ouverte/igo2-api/commit/48cb954010e4c4af49c16159530407b714e5cec8))
* **layerContext:** save visibility and other options ([a0e64e5](https://github.com/infra-geo-ouverte/igo2-api/commit/a0e64e5879a86a429475f59b10c76008954ca0a7))
* **layer:** exclude layers if not allowed ([a1166ee](https://github.com/infra-geo-ouverte/igo2-api/commit/a1166ee6350b956d0dd6e51a7f70e691841ff8e2))
* **layer:** options is merge with layer root ([280d09c](https://github.com/infra-geo-ouverte/igo2-api/commit/280d09c7d39c5e4fcbb015cab2a366abc6dad5f5))
* **permission:** add multiple permissions at the same time ([e986389](https://github.com/infra-geo-ouverte/igo2-api/commit/e9863893182495c50e2162a180134d58d1165de1))
* rewrite ([76dd361](https://github.com/infra-geo-ouverte/igo2-api/commit/76dd361b46a523adca9f42015e79877908c0de97))
* **swagger:** change base path to documentation ([feb9719](https://github.com/infra-geo-ouverte/igo2-api/commit/feb971995d53ba12e6c87aa48677902f5927ff2b))
* **tool:** add tool service ([1602032](https://github.com/infra-geo-ouverte/igo2-api/commit/1602032e96a51de8b4fe81231ca05fe17a54503d))
* **toolbar:** add toolbar in json return ([284b40f](https://github.com/infra-geo-ouverte/igo2-api/commit/284b40ff213b65be971b5aee6c42b27ba173d4a9))
* **toolsContexts:** link tool and context ([aa67c23](https://github.com/infra-geo-ouverte/igo2-api/commit/aa67c230326235a004a8509f378490d48a34b317))
* upgrade kong to 0.13 ([7dcbf37](https://github.com/infra-geo-ouverte/igo2-api/commit/7dcbf376d1140a291ee668bc5f34ba2a3aa7b93c))
* **user:** add favorite context ([e2a140c](https://github.com/infra-geo-ouverte/igo2-api/commit/e2a140c18ab5d981924cf82c21198707f5a303b3))
* **user:** create standard ldap connexion ([bdefd9b](https://github.com/infra-geo-ouverte/igo2-api/commit/bdefd9bf7931509584eb2d85b3fd89114aac2b5d))



