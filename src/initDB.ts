import * as Server from './server';
import * as Configs from './configurations';

const serverConfigs = Configs.getServerConfigs();

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
    url: '/users',
    payload: {
      sourceId: 'admin',
      source: 'msp',
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/contexts',
    headers: {
      'x-consumer-username': 'barm08'
    },
    payload: {
      uri: 'qc911',
      title: 'Qc-911',
      scope: 'public',
      map: {
        view: {
          projection: 'EPSG:3857',
          center: [-72, 52],
          zoom: 6
        }
      }
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/contexts',
    headers: {
      'x-consumer-username': 'autre'
    },
    payload: {
      uri: 'cprotect',
      title: 'context protected',
      scope: 'protected',
      map: {
        view: {
          projection: 'EPSG:3857',
          center: [-72, 52],
          zoom: 6
        }
      }
    }
  }, handleError);


  server.inject({
    method: 'POST',
    url: '/contexts',
    headers: {
      'x-consumer-username': 'autre'
    },
    payload: {
      uri: 'cpublic',
      title: 'context public',
      scope: 'public',
      map: {
        view: {
          projection: 'EPSG:3857',
          center: [-72, 52],
          zoom: 6
        }
      }
    }
  }, handleError);


  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'search',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'context',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'contextEditor'
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'mapEditor',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'layers',
      title: 'Add Layers',
      icon: 'add_location',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'directions',
      title: 'Directions',
      icon: 'directions',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'timeAnalyser',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'print',
      title: 'Print',
      icon: 'local_printshop',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/tools',
    payload: {
      name: 'measure',
      title: 'Measure',
      icon: 'straighten',
      inToolbar: true
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 1
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 2
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 3
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 4
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 5
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 6
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 7
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 8
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/toolsContexts',
    payload: {
      context_id: 1,
      tool_id: 9
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layers',
    payload: {
      title: 'MSP Base Map',
      type: 'xyz',
      source: {
        url: 'https://geoegl.msp.gouv.qc.ca/cgi-wms/mapcache.fcgi/tms/1.0.0/' +
        'carte_gouv_qc_ro@EPSG_3857/{z}/{x}/{-y}.png'
      }
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layers',
    payload: {
      title: 'MSP DESSERTE MUN 911',
      type: 'wms',
      source: {
        url: '/cgi-wms/igo_gouvouvert.fcgi',
        params: {
          layers: 'MSP_DESSERTE_MUN_911',
          version: '1.3.0'
        }
      },
      queryFormat: 'gml2',
      queryTitle: 'Municipalite'
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layers',
    payload: {
      title: 'MSP Tel. Urgence',
      type: 'wms',
      source: {
        url: '/cgi-wms/igo_gouvouvert.fcgi',
        params: {
          layers: 'telephone_urg',
          version: '1.3.0'
        }
      },
      queryFormat: 'gml2'
    }
  }, handleError);


  server.inject({
    method: 'POST',
    url: '/layersContexts',
    payload: {
      context_id: 1,
      layer_id: 1
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layersContexts',
    payload: {
      context_id: 1,
      layer_id: 2
    }
  }, handleError);

  server.inject({
    method: 'POST',
    url: '/layersContexts',
    payload: {
      context_id: 1,
      layer_id: 3
    }
  }, handleError);


  server.inject({
    method: 'POST',
    url: '/contextsPermissions',
    payload: {
      context_id: 2,
      profil: 'GRAPP-VIG-PILOTE_COG',
      typePermission: 'read'
    }
  }, handleError);

});
