# [1.7.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.6.3...1.7.0) (2022-06-21)



## [1.6.3](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.7.0...1.6.3) (2022-06-21)


### Bug Fixes

* fix node v16 ([586f76b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/586f76bf76b2cb5b59b08471c3d9808b3ba86b06))
* **cookie:** ignore invalid cookie ([5431f6f](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5431f6f675ceac9950d04b3a7e6a40ea32f534ef))
* **cookie:** ignore invalid cookie ([96fcc60](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/96fcc6068288957a36c8af43874c9a6f6ba260da))
* **migration:** fix \" string ([84aadad](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/84aadada6a3347450ba28d8e830f6c9bb36aaa7b))


### Features

* **node:** compatible with v16 ([2d613e7](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/2d613e7262aab364fedd2a93f630e9a5bd58d8fc))
* **node:** upgrade to 16 ([1bd3c31](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/1bd3c31172d69f5e4b6d8e8d0f8bc092ebd54c18))



# [1.7.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.6.1...1.7.0) (2021-06-23)


### Features

* **guides:** considering hasAcrigeo bool to display guides ([dedc02b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/dedc02b7322ac0d140175adea17f58c6a895b637))



## [1.6.1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.6.0...1.6.1) (2021-05-25)


### Bug Fixes

* **users-profils:** always empty when q passed ([5641fc4](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5641fc45fd6971dc32faa1fe6f3d9c41659f935e))



# [1.6.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.5.1...1.6.0) (2021-05-18)


### Bug Fixes

* disabled cache ([c7d7410](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/c7d741098b5fa28fe20743317912fc6b797b9645))
* upgrade igo2 ([33c757f](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/33c757fe224e5e1590fe709b486a051963cac25d))
* **catalog:** bad column name ([824f50b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/824f50b93926451829de2cf0d5bfef008286dfee))
* **layer:** getBySource without id ([a2c271e](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a2c271eb9f4d16cd5c7f4e96d390ef7ff2e241b5))
* **migration:** options with ${} is now correctly migrate ([4c7de60](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4c7de60ed343754112a1b27526f331edc1f0c740))
* **migration:** use node prod ([13a4317](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/13a43172ceb4b25f97273a015ea40c7e208ad0f7))
* **options:** fix when url is localhost but not apis ([13f35e4](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/13f35e4fdc863a5a3b928fc093a81886a276f686))
* **options:** replace $or by Op.or ([4504bdb](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4504bdb25a00b73c33afdb064d91723bc4d92e84))
* **profils:** verify if array empty ([b17e32d](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/b17e32ddc71575725df5af5860ca46678db46675))


### Features

* **deps:** upgrade igo2-libs ([d0754a2](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/d0754a2c58269ba7e3801d3e7d659d572df09e97))
* **profil:** add guides ([d435889](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/d435889c4b7f118f5c087950e814d53e0fc52418))
* **tool:** add tool security ([723d23a](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/723d23a7d9465952b1d077fc30946e89d59abeb9))
* **userIGO:** add mergePreference option ([b2ee3a1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/b2ee3a19a871e1da4361c7901ccfd704cfcf42c8))
* **userIGO:** add mergePreference option ([a00772f](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a00772fcec576f9672073f2c3c2e3bc156c0ed2a))



## [1.5.1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.5.0...1.5.1) (2021-01-14)


### Bug Fixes

* **migration:** case insensitive ([4006ab8](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4006ab8f4266f54dc3e9d4010f54e4e08723c24f))
* **migration:** fix when layerOptions is null ([7f41376](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/7f41376ed3ff56b10b92a3e318d1d3fdd580f6b4))
* **migration:** fix when layerOptions is null ([88d48aa](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/88d48aa760b0cb1718b4e3c759e3b0d156cb0d50))
* **migration:** remove \n at the end ([3937e6d](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/3937e6d971bbd2ecf366edfc8c8e82cd5774ad4f))


### Features

* **profils:** can share even if not in the grapp ([2927e91](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/2927e911fff6f3123b21494814b2d0c4a94a47d5))



# [1.5.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.4.0...1.5.0) (2020-12-03)



# [1.4.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.3.0...1.4.0) (2020-12-03)


### Bug Fixes

* **migration:** error when ' in options ([f8704dd](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/f8704dd1b75b0d69e26bb941074dd95160f59e9c))
* **migration:** error when ' in options ([bc40929](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/bc40929df5f4a6707bbfd9cf0a047b1fe4486b41))
* **migration:** error when ' in options ([3cfbf44](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/3cfbf4496b0e130d4906592a906854146e40b71e))
* **migration:** error when ' in options ([6afa946](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/6afa94660bbf9291b6ada3cc89ab8924bd1d4e7b))
* **migration:** escape quotes ([5fc6e4b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5fc6e4b2a3945e08c828a43edaf95a2295157a11))
* **migration:** show url when no layers ([cdae052](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/cdae052d805418e4838f5eb6c65e7bb8de0a70fd))
* **migration:** use name instead of position ([5b6db22](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5b6db22cb57efd1045a9a04b0e965b84df6158b2))
* **options:** key allowed ([a5c2bfa](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a5c2bfaa9a35dcee9c5e252806abf1d630b13e40))
* **url:** string length ([e4d6dbf](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/e4d6dbf9fc5075aab9967591240d19b8b358951d))
* **wfs:** return wfs options if not found ([a5cc2e2](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a5cc2e2f2336115115b5ee86be37df4312258aa2))


### Features

* **migration:** add migration script ([b4f12f4](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/b4f12f48fe02b4e0b7107cb5c8e0092bbb9fa8f6))
* **options:** add options api ([f4b3082](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/f4b3082f892121061359c11f07a862a0de427ef4))
* **options:** link with permissions ([2c30dbf](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/2c30dbf238441bdd66e0a70680918ab46aed0397))



# [1.3.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.2.0...1.3.0) (2020-09-24)


### Bug Fixes

* **catalog:** overlap permissions ([4a47b69](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4a47b69ada9624254e7b6777202009ec2aee6086))


### Features

* **catalog:** add permissions to catalogs ([cfc11e1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/cfc11e104e66f8e4cfd561c141ae17e5c673813b))



# [1.2.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.1.1...1.2.0) (2020-08-26)


### Bug Fixes

* **context:** can filter by username ([fd7a8a9](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/fd7a8a913088428680f8a137ffa85c44fd444d44))
* **contexte:** maxZoomOnExtent interface ([69b786f](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/69b786f0743cd1ca7a010b2f3de7061a81e83bef))
* **contextHidden:** minor fixes ([f6ff507](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/f6ff507fca4da9e7edb20ab6d4b9786fcd25d898))
* **contextHidden:** post method ([af31f89](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/af31f894137b8126f9e22cd8d9ec933c80265d52))
* **hidden:** hiddens ! ([b3c9653](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/b3c9653ea588d232d55d133ecb50d04d003bd468))
* **profil:** can share ([71f2e92](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/71f2e929a3ccefada8c3dda9564d26e72dc65bad))
* **profil:** can share ([e295124](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/e295124089c6a103d487cb82d0bd957c9ba6e809))
* **profil:** return profils only if you have same ([5f7c3a2](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5f7c3a203c23a7bee45e6452fb4954581d0de685))
* **profilIgo:** get user by username ([d6b46c3](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/d6b46c30fd3d33edf731c094955bf4f1c9150e3a))
* **route:** allow unknown ([db87d5d](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/db87d5dc5466759d8f8d8e1b81292a7c91fd85b7))
* **user-igo:** preference undefined ([21ab604](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/21ab604e3b613471b44e37cd1648103e18bd3034))
* **user-igo:** update preference ([7260c38](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/7260c38d3d8cfc44bc8ae744890e9999c71595b3))
* **userIgo:** contextId is not required ([279c7e2](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/279c7e236f8a8da867e3af2a072c9cedcd10287b))


### Features

* **context:** add possibility to filter contexts ([a8c1d55](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a8c1d5516ec775ba6a19152054cd969847db941b))
* **context:** filter hidden contexts ([18c964a](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/18c964a5fc9046c6ff90cf27cece85360b04c879))
* **context:** order by create date ([080c160](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/080c16000869ff9a2f8bc5ac84cf12538bcf631f))
* **contextHidden:** add possibility to hide context ([0ff8889](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/0ff8889c2acf205311f3e3a91d11fe12dc391b1e))
* **permission:** can delete permission to your user ([bff327e](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/bff327e01bf8dc2ecdd23048b7ad59c27b2dfa27))
* **permissions:** add filter profils and users list ([ce3d508](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/ce3d5086bbc376bba00279cc34de703978d72774))
* **permissions:** verify permissions ([df39587](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/df39587fc8ba5281c27d07ed79492be4f368bfb6))
* **plugin:** apm and logger ([4ab86d9](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4ab86d97e57bc488d3fe8c6feaaa26798537cd38))
* **profil:** add cegrim ([ef87420](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/ef874207787fdd326137b4fd1746ed2e0326776a))
* **profil:** can share and filter ([8fd3f07](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/8fd3f0794cf19899af839dc2a9c2ddf28ff37fe1))
* **profil:** return profils only if you have same ([a6599d2](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a6599d2de01e2f7915e162febca84cebc8f035ee))
* **profil-user:** add limit ([e4b785f](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/e4b785fe1b7b58e86e98e2afa190db930c4c6891))
* **profilIgo:** add profils list used in igo ([3f4d48b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/3f4d48b7c8bdc3ad01cd9284ff10b6d42a9e6d24))
* **profilIgo:** childs profils ([4c27ecb](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4c27ecb5308561e20e00ca6bff105c50ea382996))
* **routes:** strip unknown ([503a2ad](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/503a2adf700a855b3a681969cba98ec616806e2e))
* **urgence:** add urgence preference ([8515ad8](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/8515ad8d4f28f79b8d7356ac5d0d19ce1a82ebb1))
* **user-igo:** add preference ([6158816](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/61588160ec7b8720acfb8842195e1634aad97798))



## [1.1.1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.1.0...1.1.1) (2020-06-02)


### Bug Fixes

* **context:** length to max ([cae70c9](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/cae70c9a590d67bc5aeb43938b1cbf510ad286d3))



# [1.1.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.0.1...1.1.0) (2020-06-02)


### Bug Fixes

* **context:** limit length title and uri ([46c2edd](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/46c2edd8ef7a7e4a1847522ce522af98d000ada3))


### Features

* **options:** add options route ([b4e41b7](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/b4e41b7192da8ab25d502db43407b7b8413c1905))



## [1.0.1](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/1.0.0...1.0.1) (2020-02-03)



# [1.0.0](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/compare/4f9909882a6879e7b1ea39a42ee3a7872ef82c24...1.0.0) (2020-01-27)


### Bug Fixes

* lint ([bfae826](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/bfae8269fed22f93b1635d40d6b6b266fa50cbc8))
* **catalog:** sort ([a356ba5](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a356ba5ce401497c75d19021e26c7b59634fb5e8))
* **context:** clone context now keep layer Options ([4f26fa3](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4f26fa31ab35adb0092aac4665d07f09026fcd02))
* **context:** remove unused params ([14d074c](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/14d074cc0e7ed4c95f9545cc5e7032a24ec203ee))
* **dpi:** remove params dpi ([888325d](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/888325dd39859c8c95d7aadb1faae0c3c1469189))
* **layer:** getBySource compare only url and layers ([48f30ea](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/48f30eaf033e196c22ac59d8dcfc028048864a36))
* **layer:** param LAYERS is uppercase ([c8df656](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/c8df656245dd579dcbd2f4990a0a72591a04f960))
* **layer:** remove doublon ([a66b8b7](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/a66b8b7d6047c94a00c10676ba4f4e8253ac6d0e))
* **localhost:** remove domain when localhost ([5ceae57](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/5ceae576d1710ffd53712717af1d4ca8db6a64cd))
* **uniqueConstraintError:** remove fields comparaison ([c8d2a8b](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/c8d2a8b72fea4f9b2dc6bf215148b2b6d163fedf))
* **user:** failback to default context ([4b53f59](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4b53f59735de89137f93ae5aee87a3b360be947c))


### Features

* transfert from github ([4f99098](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4f9909882a6879e7b1ea39a42ee3a7872ef82c24))
* **catalog:** add options ([33d0519](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/33d05195538070f2bf56847d82a385c27de6b2e3))
* **catalog:** add sort possibility ([7ef4871](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/7ef4871a632d2ce816c79d11485292c498979c58))
* **context:** save last access ([4fae188](http://gitlab.forge.gouv.qc.ca/igo2/igo2-api/commit/4fae188f11dcad716447b75a57f401f8000c2b20))



