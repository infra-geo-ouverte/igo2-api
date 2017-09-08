import * as Sequelize from 'sequelize';

interface ViewLayer {
  attribution?: string;
  minZoom?: number;
  maxZoom?: number;
};

interface OptionsLayer {
  visible?: boolean;
  title?: string;
};

export interface ILayerContext {
  id?: string;
  layerId?: string;
  contextId?: string;
  view?: ViewLayer;
  order?: number;
  options?: OptionsLayer;
};

export interface LayerContextInstance
  extends Sequelize.Instance<ILayerContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  layerId: string;
  contextId: string;
  view: ViewLayer;
  order: number;
  options?: OptionsLayer;
}

export interface LayerContextModel
  extends Sequelize.Model<LayerContextInstance, ILayerContext> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const layerContext = sequelize.define<LayerContextModel, ILayerContext>(
    'layerContext', {
      'id': {
        'type': DataTypes.INTEGER,
        'allowNull': false,
        'primaryKey': true,
        'autoIncrement': true
      },
      'view': {
        'type': DataTypes.TEXT,
        'get': function() {
          const view = this.getDataValue('view');
          return view ? JSON.parse(view) : {};
        },
        'set': function(val) {
          this.setDataValue('view', JSON.stringify(val));
        }
      },
      'options': {
        'type': DataTypes.TEXT,
        'get': function() {
          const options = this.getDataValue('options');
          return options ? JSON.parse(options) : {};
        },
        'set': function(val) {
          this.setDataValue('options', JSON.stringify(val));
        }
      },
      order: {
        type: DataTypes.INTEGER,
      },
      contextId: {
        type: DataTypes.INTEGER
      },
      layerId: {
        type: DataTypes.INTEGER
      }
    },
    {
      'indexes': [{
        'unique': true,
        'fields': ['contextId', 'layerId']
        }, {
          'fields': ['contextId']
        }, {
          'fields': ['layerId']
      }],
      'tableName': 'layerContext',
      'timestamps': true
    }
  );

  const layer = sequelize.models['layer'];
  const context = sequelize.models['context'];

  layer.belongsToMany(context, {
    through: {
      model: layerContext,
      unique: false
    },
    foreignKey: {
      name: 'layerId',
      allowNull: false
    }
  });

  context.belongsToMany(layer, {
    through: {
      model: layerContext,
      unique: false
    },
    foreignKey: {
      name: 'contextId',
      allowNull: false
    }
  });

  layerContext.sync();

  return layerContext;
}
