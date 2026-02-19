import { IncomingHttpHeaders } from 'http';

import { AppInstance } from '../../app.interface';
import { HEADERS_USER_1, HEADERS_USER_2 } from '../../auth/test/auth.mock';
import { ILayer, ILayerIn } from '../layer.interface';

export const LAYER_MOCK_1: ILayerIn = {
  type: 'xyz',
  layerOptions: {
    title: 'Imagerie',
    baseLayer: true,
    name: 'imagerie',
    visible: true,
    opacity: 1,
    zIndex: 8
  },
  sourceOptions: {
    type: 'xyz',
    url: 'http:test.com/carto/tms/1.0.0/orthos@EPSG_3857/{z}/{x}/{-y}.jpeg',
    optionsFromCapabilities: true,
    maxZoom: 19,
    attributions:
      "  © <a href='http://www.droitauteur.gouv.qc.ca/copyright.php'  target='_blank'><img src='/images/logo_qc.svg' width='66' height='20'>Gouvernement du Québec</a> /  Fondé sur<a href='https://github.com/infra-geo-ouverte/igo2' target='_blank'> IGO2</a>",
    params: {}
  },
  url: 'http:test.com/carto/tms/1.0.0/orthos@EPSG_3857/{z}/{x}/{-y}.jpeg'
};

export const LAYER_MOCK_2: ILayerIn = {
  type: 'wms',
  layerOptions: {
    title: 'MSP DESSERTE MUN 911',
    maxResolution: 26458.31904584105,
    minResolution: 0.02645831904584105,
    extent: [
      -10042999.556489397, 5291172.618263009, -5207770.682189084,
      9422636.923998903
    ],
    metadata: {
      url: 'https://www.donneesquebec.ca/recherche/fr/dataset/6a052cb5-42e6-4735-8626-02f62f1294d0',
      extern: true
    },
    legendOptions: {
      stylesAvailable: [{ name: 'default', title: 'default' }]
    },
    name: 'msp_desserte_mun_911',
    opacity: 1,
    visible: true,
    zIndex: 11
  },
  sourceOptions: {
    type: 'wms',
    url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
    optionsFromCapabilities: true,
    params: { LAYERS: 'MSP_DESSERTE_MUN_911', VERSION: '1.3.0' },
    queryable: false,
    queryFormat: 'gml2',
    queryTitle: 'Municipalite'
  },
  url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi'
};

export async function appendLayers(app: AppInstance) {
  const promises = [
    await createLayer(app, HEADERS_USER_1, LAYER_MOCK_1),
    await createLayer(app, HEADERS_USER_2, LAYER_MOCK_2)
  ];
  const result = await Promise.all(promises);
  return result.map((layer) => layer.json<ILayer>());
}

export async function createLayer(
  app: AppInstance,
  headers: IncomingHttpHeaders,
  payload: ILayerIn
) {
  const response = await app.inject({
    method: 'POST',
    headers,
    url: `/layers`,
    payload
  });

  return response;
}
