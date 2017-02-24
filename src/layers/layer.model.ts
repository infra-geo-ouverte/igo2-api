import * as Sequelize from 'sequelize';

interface ViewLayer {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

interface SourceLayer {
  url: string;
};

export interface ILayer  {
    title: string;
    type: string;
    url: string;
    protected: boolean;
    view: ViewLayer;
    source: SourceLayer;
};

export interface LayerInstance extends Sequelize.Instance<ILayer> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  type: string;
  url: string;
  protected: boolean;
  view: ViewLayer;
  source: SourceLayer;
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
        'title': {
            'type': DataTypes.STRING(64),
            'allowNull': false
        },
        'type': {
            'type': DataTypes.STRING(32),
            'allowNull': false
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
        }
    },
    {
        'tableName': 'layer',
        'timestamps': true
    });

    layer.sync();

    return layer;
}
