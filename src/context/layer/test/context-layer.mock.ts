import { AppInstance } from '../../../app.interface';
import { HEADERS_USER_1, HEADERS_USER_2 } from '../../../auth/test/auth.mock';
import { LayerGroupOptions, LayerOptions, SourceOptions } from '../../../layer';
import { LAYER_MOCK_1, LAYER_MOCK_2 } from '../../../layer/test/layer.mock';
import { IContext, IContextDetailedIn } from '../../context.interface';
import { appendContextsWithPermission } from '../../permission/test/context-permission.mock';
import {
  ALL_CONTEXTS,
  CONTEXT_1_MOCK,
  CONTEXT_3_MOCK,
  CONTEXT_4_MOCK,
  getContextDetails
} from '../../test/context.mock';

export const CONTEXT_LAYER_MOCK_1: LayerOptions = {
  ...LAYER_MOCK_1.layerOptions,
  type: LAYER_MOCK_1.type,
  sourceOptions: LAYER_MOCK_1.sourceOptions as SourceOptions | undefined
};

export const CONTEXT_LAYER_MOCK_2: LayerOptions = {
  ...LAYER_MOCK_2.layerOptions,
  type: LAYER_MOCK_2.type,
  sourceOptions: LAYER_MOCK_2.sourceOptions as SourceOptions | undefined
};

export const CONTEXT_LAYER_MOCK_3: LayerGroupOptions = {
  type: 'group',
  title: 'Test1',
  name: 'test1',
  collapsed: false,
  opacity: 1,
  visible: true,
  zIndex: 12,
  children: [
    {
      title: 'MSP Tel. Urgence',
      extent: [
        -10042999.556489397, 5291172.618263009, -5207770.682189084,
        9422636.923998903
      ],
      metadata: {
        url: 'https://www.donneesquebec.ca/recherche/dataset/telephone-durgence',
        extern: true,
        abstract: 'Téléphones de secours (Source : MTQ)',
        keywordList: ['Téléphones de secours (secteur routier)']
      },
      legendOptions: {
        stylesAvailable: [{ name: 'default', title: 'default' }]
      },
      sourceOptions: {
        type: 'wms',
        url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
        optionsFromCapabilities: true,
        params: { LAYERS: 'telephone_urg', VERSION: '1.3.0' },
        queryable: true,
        queryFormat: 'gml2',
        queryTitle: 'desclocal'
      },
      name: 'msp_tel._urgence',
      opacity: 1,
      visible: true
    }
  ]
};

export const CONTEXT_LAYER_MOCK_4: LayerGroupOptions = {
  type: 'group',
  title: 'Test2',
  name: 'test2',
  collapsed: false,
  opacity: 1,
  visible: true,
  zIndex: 13,
  children: [
    {
      type: 'group',
      title: 'Test3',
      children: [
        {
          type: 'group',
          title: 'Test4',
          children: [CONTEXT_LAYER_MOCK_1],
          name: 'test4',
          collapsed: false,
          opacity: 1,
          visible: true
        }
      ],
      name: 'test3',
      collapsed: false,
      opacity: 1,
      visible: true
    }
  ]
};

export const CONTEXT_WITH_LAYERS_1_MOCK: IContextDetailedIn = {
  ...(CONTEXT_1_MOCK as IContext),
  layers: [
    CONTEXT_LAYER_MOCK_1,
    CONTEXT_LAYER_MOCK_2,
    CONTEXT_LAYER_MOCK_3,
    CONTEXT_LAYER_MOCK_4
  ]
};

export const CONTEXT_WITH_LAYERS_3_MOCK: IContextDetailedIn = {
  ...(CONTEXT_3_MOCK as IContext),
  layers: [CONTEXT_LAYER_MOCK_1, CONTEXT_LAYER_MOCK_3]
};

export const CONTEXT_WITH_LAYERS_4_MOCK: IContextDetailedIn = {
  ...(CONTEXT_4_MOCK as IContext),
  layers: [CONTEXT_LAYER_MOCK_1]
};

export async function appendContextsDetailledWithLayers(app: AppInstance) {
  const [_context1, context2, _context3, _context4, ...otherContexts] =
    ALL_CONTEXTS;
  const contexts = [
    CONTEXT_WITH_LAYERS_1_MOCK,
    context2,
    CONTEXT_WITH_LAYERS_3_MOCK,
    CONTEXT_WITH_LAYERS_4_MOCK,
    ...otherContexts
  ];
  const data = await appendContextsWithPermission(app, contexts);

  const context1 = await getContextDetails(
    app,
    data.user1[1].context.id!,
    HEADERS_USER_1
  );
  const context3 = await getContextDetails(
    app,
    data.user2[3].context.id!,
    HEADERS_USER_2
  );

  const context4 = await getContextDetails(
    app,
    data.user2[4].context.id!,
    HEADERS_USER_2
  );

  data.user1[1].context = context1.json();
  data.user2[3].context = context3.json();
  data.user2[4].context = context4.json();
  return data;
}
