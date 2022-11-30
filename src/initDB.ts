import { Server, Config, Base64 } from '@igo2/base-api';
import { IgoJWTUser } from './login/login.interface';
import { IProfilIgo } from './profilIgo/profilIgo.interface';

import * as Jwt from 'jsonwebtoken';
import { ILayer } from './layer/layer.interface';
import { ITool } from './tool/tool.interface';
import { CredentialsConfig, JwtConfig } from './configurations';

Config.readConfig(__dirname, `configurations/config.${process.env.NODE_ENV || 'dev'}.json`);

const serverConfigs = Config.getServerConfig();
const jwtConfig = Config.getConfig('jwt') as JwtConfig;
const credentialsConfig = Config.getConfig('credentials') as CredentialsConfig;
const adminCredentialsConfig = credentialsConfig.admins[0];

const initDB = async () => {
  const server = await Server.init(serverConfigs);

  const adminInfoPayload: IgoJWTUser = {
    user: {
      id: adminCredentialsConfig.username,
      source: 'igo',
      sourceId: adminCredentialsConfig.username,
      firstName: adminCredentialsConfig.firstName || 'ADMIN',
      lastName: adminCredentialsConfig.lastName || 'ADMIN',
      email: adminCredentialsConfig.email,
      isAdmin: true
    }
  };

  const token = Jwt.sign(
    adminInfoPayload,
    jwtConfig.secretKey,
    Object.assign({}, jwtConfig.signOptions, { expiresIn: '14050d' })
  );

  const adminTokenHeaders = {
    authorization: `Bearer ${token}`
  };

  const handleError = (response) => {
    if (response.statusCode < 200 || response.statusCode >= 400) {
      console.log('=====================ERROR===================');
      console.error(response.result);
      console.log('=============================================');
    }
  };

  // CREATE THE USERS
  const profilsToCreate = [];
  credentialsConfig.admins.concat(
    credentialsConfig.users).map(user => {
    profilsToCreate.concat(user.profils);
    server
      .inject({
        method: 'POST',
        url: '/login',
        headers: adminTokenHeaders,
        payload: {
          username: user.username,
          password: Base64.encode(user.password),
          source: user.source || 'igo'
        }
      })
      .catch(handleError);
  });

  // CREATE THE PROFILS
  const canShareToProfils = [];
  adminCredentialsConfig.profils.map((p, i) => {
    if (p !== 'admin') {
      canShareToProfils.push(i);
    }
  });
  if (adminCredentialsConfig.profils) {
    adminCredentialsConfig.profils.map((profil, id) => {
      const payload: IProfilIgo = {
        id,
        name: profil,
        title: profil

      };
      if (profil === 'admin') {
        payload.canShare = true;
        payload.canFilter = true;
        payload.canShareToProfils = canShareToProfils;
      }

      server
        .inject({
          method: 'POST',
          url: '/profils',
          headers: adminTokenHeaders,
          payload
        })
        .catch(handleError);
    });
  }

  const toolToAdd = [
    'about',
    'activeOgcFilter',
    'activeTimeFilter',
    'advancedMap',
    'catalog',
    'catalogBrowser',
    'contextEditor',
    'contextManager',
    'contextPermissionManager',
    'directions',
    'draw',
    'importExport',
    'map',
    'map-proximity',
    'mapDetails',
    'mapLegend',
    'mapTools',
    'measurer',
    'ogcFilter',
    'print',
    'searchResults',
    'shareMap',
    'spatialFilter',
    'timeFilter'
  ];
  const toolToAddOutToolBar = [
    'activeOgcFilter', 'activeTimeFilter', 'contextEditor', 'contextPermissionManager', 'catalogBrowser'
  ];
  toolToAdd.map(name => {
    server
      .inject({
        method: 'POST',
        url: '/tools',
        headers: adminTokenHeaders,
        payload: {
          name,
          inToolbar: !toolToAddOutToolBar.includes(name)
        } as ITool
      })
      .catch(handleError);
  });

  server
    .inject({
      method: 'POST',
      url: '/layers',
      headers: adminTokenHeaders,
      payload: {
        layerOptions: {
          title: 'Relief',
          baseLayer: true
        },
        sourceOptions: {
          type: 'xyz',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' + 'carte_relief@EPSG_3857/{z}/{x}/{-y}.png'
        },
        global: true
      } as ILayer
    })
    .catch(handleError);

  server
    .inject({
      method: 'POST',
      url: '/layers',
      headers: adminTokenHeaders,
      payload: {
        layerOptions: {
          title: 'Satellite',
          baseLayer: true
        },
        sourceOptions: {
          type: 'xyz',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' + 'orthos@EPSG_3857/{z}/{x}/{-y}.png'
        },
        global: true
      } as ILayer
    })
    .catch(handleError);

  // todo inject hidden
  // todo inject private
  server
    .inject({
      method: 'POST',
      url: '/contexts',
      headers: adminTokenHeaders,
      payload: {
        uri: 'default',
        title: 'Default',
        scope: 'public',
        map: {
          view: {
            projection: 'EPSG:3857',
            center: [-72, 52],
            zoom: 6
          }
        },
        tools: [
          { id: '21' },
          { id: '2' },
          { id: '7' }, { id: '8' }, { id: '9' },
          { id: '17' },
          { id: '23' },
          { id: '18' },
          { id: '11' },
          { id: '10' },
          { id: '5' },
          { id: '6' },
          { id: '12' },
          { id: '20' },
          { id: '22' },
          { id: '1' },
          { id: '4' }
        ],
        layers: [
          {
            global: true,
            layerOptions: {
              title: 'Plan',
              baseLayer: true
            },
            sourceOptions: {
              type: 'xyz',
              visible: true,
              url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' + 'carte_gouv_qc_ro@EPSG_3857/{z}/{x}/{-y}.png'
            }
          },
          {
            sourceOptions: {
              type: 'wms',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              params: {
                layers: 'site_inv_geotech_p'
              }
            }
          },
          {
            sourceOptions: {
              type: 'wms',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              params: {
                layers: 'telephone_urg'
              }
            }
          },
          {
            layerOptions: {
              title: 'WFS Layer',
              visible: false
            },
            sourceOptions: {
              type: 'wfs',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              queryable: true,
              params: {
                featureTypes: 'bgr_v_centr_servc_geomt_act',
                fieldNameGeometry: 'geometry',
                outputFormat: 'geojson'
              },
              sourceFields: [
                { name: 'nom_unite_', alias: 'Nom du CS' },
                { name: 'dat_debut_', alias: 'Début CS' },
                { name: 'ide_unite_', alias: 'Identifiant du CS' }
              ],
              ogcFilters: {
                allowedOperatorsType: 'all',
                enabled: true,
                editable: true,
                filters: {
                  operator: 'PropertyIsEqualTo',
                  propertyName: 'ide_unite_',
                  expression: '1713'
                }
              }
            }
          },

          {
            layerOptions: {
              title: 'WMS-WFS isOgcFilterable HasFilters HasSourceFields'
            },
            sourceOptions: {
              type: 'wms',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              params: {
                layers: 'bgr_v_sous_route_res_sup_act',
                version: '1.3.0'
              },

              paramsWFS: {
                featureTypes: 'bgr_v_sous_route_res_sup_act',
                fieldNameGeometry: 'geometry',
                outputFormat: 'geojson'
              },
              ogcFilters: {
                allowedOperatorsType: 'all',
                enabled: true,
                editable: true,
                filters: {
                  operator: 'Intersects',
                  geometryName: 'geometry',
                  wkt_geometry:
                  'POLYGON((-8015003 5942074,' +
                  '-8015003 5780349,-7792364 5780349,' +
                  '-7792364 5942074,-8015003 5942074))'
                }
              },
              sourceFields: [{ alias: 'No RTSS', excludeFromOgcFilters: false, name: 'num_rts' }]
            }
          }
        ]
      }
    })
    .catch(handleError);

  server
    .inject({
      method: 'POST',
      url: '/catalogs',
      headers: adminTokenHeaders,
      payload: {
        title: 'Service web du MTQ grand public',
        order: 1,
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq'
      }
    })
    .catch(handleError);

  server
    .inject({
      method: 'POST',
      url: '/catalogs',
      headers: adminTokenHeaders,
      payload: {
        title: 'Service web du MTQ privé',
        order: 2,
        url: 'https://ws.mapserver.transports.gouv.qc.ca/applicatif',
        profils: ['admin']
      }
    })
    .catch(handleError);
};

if (!adminCredentialsConfig || !adminCredentialsConfig.username) {
  console.error('Must have adminCredentialsConfig.username in configuration.');
  process.exit(1);
} else {
  initDB();
}
