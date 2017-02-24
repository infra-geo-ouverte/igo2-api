import * as Sequelize from 'sequelize';

interface PropertiesLayerContext {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

export interface ILayerContext  {
    properties: PropertiesLayerContext;
};

export interface LayerContextInstance
       extends Sequelize.Instance<ILayerContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  properties: PropertiesLayerContext;
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
        'properties': {
            'type': DataTypes.TEXT,
            'get': function() {
                return JSON.parse(this.getDataValue('properties'));
            },
            'set': function(val) {
                this.setDataValue('properties', JSON.stringify({}));
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
