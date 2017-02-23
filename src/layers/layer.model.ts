import * as Sequelize from 'sequelize';

interface PropertiesLayer {
  center: string;
  zoom: number;
};

export interface ILayer  {
    name: string;
    url: string;
    protected: boolean;
    properties: PropertiesLayer;
};

export interface LayerInstance extends Sequelize.Instance<ILayer> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  url: string;
  protected: boolean;
  properties: PropertiesLayer;
}

export interface LayerModel
       extends Sequelize.Model<LayerInstance, ILayer> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
    const layer = sequelize.define<LayerModel, ILayer>('layer', {
        'id': {
            'type': DataTypes.INTEGER,
            'allowNull': false,
            'primaryKey': true,
            'autoIncrement': true
        },
        'name': {
            'type': DataTypes.STRING(64)
        },
        'url': {
            'type': DataTypes.STRING(255),
            'validate': {
                'isUrl': true
            }
        },
        'protected': {
            'type': DataTypes.BOOLEAN
        },
        'properties': {
            'type': DataTypes.TEXT,
            'get': function() {
                return JSON.parse(this.getDataValue('properties'));
            },
            'set': function(val) {
                this.setDataValue('properties', JSON.stringify({}));
            }
        }
    },
    {
        'tableName': 'layer',
        'timestamps': true
    });

    layer.sync();

    return layer;
}
