import * as Sequelize from 'sequelize';

export interface SourceOptions {
  type?: string;
  url?: string;
  version?: string;
  params?: { [key: string]: any };
  legend?: any;
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
}

export interface ILayer {
  id?: string;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerInstance extends Sequelize.Instance<ILayer> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

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
      layerOptions: {
        type: DataTypes.JSON
      },
      sourceOptions: {
        type: DataTypes.JSON
      }
    },
    {
      tableName: 'layer',
      timestamps: true
    }
  );

  layer.sync();

  return layer;
}
