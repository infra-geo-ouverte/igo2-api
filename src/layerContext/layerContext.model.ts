import * as Sequelize from 'sequelize';

import { SourceOptions, LayerOptions } from '../layer';

export interface ILayerContext {
  id?: string;
  layerId?: string;
  contextId?: string;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerContextInstance
  extends Sequelize.Instance<ILayerContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  layerId: string;
  contextId: string;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerContextModel
  extends Sequelize.Model<LayerContextInstance, ILayerContext> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const layerContext = sequelize.define<LayerContextModel, ILayerContext>(
    'layerContext',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      layerOptions: {
        type: DataTypes.JSON
      },
      sourceOptions: {
        type: DataTypes.JSON
      },
      contextId: {
        type: DataTypes.INTEGER
      },
      layerId: {
        type: DataTypes.INTEGER
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['contextId', 'layerId']
        },
        {
          fields: ['contextId']
        },
        {
          fields: ['layerId']
        }
      ],
      tableName: 'layer_context',
      timestamps: true
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
