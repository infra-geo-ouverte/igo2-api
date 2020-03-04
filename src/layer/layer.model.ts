import * as Sequelize from 'sequelize';

export interface SourceOptions {
  version?: string;
  params?: { [key: string]: any };
  [key: string]: any;
}

export interface LayerOptions {
  title?: string;
  baseLayer?: boolean;
  opacity?: number;
  visible?: boolean;
  extent?: [number, number, number, number];
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  [key: string]: any;
}

export interface ILayer {
  id?: string;
  type?: string;
  url?: string;
  layers?: string;
  global?: boolean;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerInstance extends Sequelize.Instance<ILayer> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  type: string;
  url?: string;
  layers?: string;
  global?: boolean;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerModel extends Sequelize.Model<LayerInstance, ILayer> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const layer = sequelize.define<LayerModel, ILayer>(
    'layer',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING(16),
        allowNull: false
      },
      url: {
        type: DataTypes.STRING(128)
      },
      layers: {
        type: DataTypes.STRING(128)
      },
      global: {
        type: DataTypes.BOOLEAN
      },
      layerOptions: {
        type: DataTypes.JSON
      },
      sourceOptions: {
        type: DataTypes.JSON
      }
    },
    {
      tableName: 'layer',
      timestamps: true,
      indexes: [{
        unique: true,
        fields: ['type', 'url', 'layers']
      }, {
        unique: false,
        fields: ['global']
      }]
    }
  );

  layer.sync();

  return layer;
}
