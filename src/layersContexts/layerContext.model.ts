import * as Sequelize from 'sequelize';

interface ViewLayer {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

interface SourceLayer {
  url: string;
};

export interface ILayerContext {
  view: ViewLayer;
  source: SourceLayer;
};

export interface LayerContextInstance
  extends Sequelize.Instance<ILayerContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  view: ViewLayer;
  source: SourceLayer;
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
          return JSON.parse(this.getDataValue('view'));
        },
        'set': function(val) {
          this.setDataValue('view', JSON.stringify({}));
        }
      },
      'source': {
        'type': DataTypes.TEXT,
        'get': function() {
          return JSON.parse(this.getDataValue('source'));
        },
        'set': function(val) {
          this.setDataValue('source', JSON.stringify({}));
        }
      },
      context_id: {
        type: DataTypes.INTEGER
      },
      layer_id: {
        type: DataTypes.INTEGER
      }
    },
    {
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
      name: 'layer_id',
      allowNull: false
    }
  });

  context.belongsToMany(layer, {
    through: {
      model: layerContext,
      unique: false
    },
    foreignKey: {
      name: 'context_id',
      allowNull: false
    }
  });

  layerContext.sync();

  return layerContext;
}
