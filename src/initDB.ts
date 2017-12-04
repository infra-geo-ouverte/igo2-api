import * as Server from './server';
import * as Configs from './configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;

Server.init(serverConfigs).then((server) => {

  const handleError = (response) => {
    if (response.statusCode < 200 || response.statusCode >= 400) {
      console.log('=====================ERROR===================');
      console.error(response.result);
      console.log('=============================================');
    }
  };

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'searchResults',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'contextManager',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'contextEditor'
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'permissionsContextManager',
      inToolbar: false
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'toolsContextManager',
      inToolbar: false
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'mapDetails',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'timeAnalysis',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'print',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'catalog',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'catalogLayers',
      inToolbar: false
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      name: 'shareMap',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layers',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      title: 'Relief',
      type: 'xyz',
      baseLayer: true,
      source: {
        url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' +
        'carte_relief@EPSG_3857/{z}/{x}/{-y}.png'
      }
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layers',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
    payload: {
      title: 'Satellite',
      type: 'xyz',
      baseLayer: true,
      source: {
        url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' +
        'orthos@EPSG_3857/{z}/{x}/{-y}.png'
      }
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/contexts',
    headers: {
      'x-consumer-username': admin.xConsumerUsername,
      'x-consumer-id': admin.xConsumerId
    },
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
        {id: '1'},
        {id: '2'},
        {id: '3'},
        {id: '4'},
        {id: '5'},
        {id: '6'},
        {id: '7'},
        {id: '8'},
        {id: '9'},
        {id: '10'},
        {id: '11'}
      ],
      layers: [{
        title: 'Plan',
        type: 'xyz',
        baseLayer: true,
        visible: true,
        source: {
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/' +
          'carte_gouv_qc_ro@EPSG_3857/{z}/{x}/{-y}.png'
        }
      }, {
        title: 'MSP DESSERTE MUN 911',
        type: 'wms',
        source: {
          url: '/ws/igo_gouvouvert.fcgi',
          params: {
            layers: 'MSP_DESSERTE_MUN_911',
            version: '1.3.0'
          }
        }
      }, {
        title: 'MSP Tel. Urgence',
        type: 'wms',
        source: {
          url: '/ws/igo_gouvouvert.fcgi',
          params: {
            layers: 'telephone_urg',
            version: '1.3.0'
          }
        }
      }]
    }
  }, handleError);

});
