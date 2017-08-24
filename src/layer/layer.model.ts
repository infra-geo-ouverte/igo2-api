import * as Sequelize from 'sequelize';

interface ViewLayer {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

export interface SourceLayer {
  url: string;
  params?: { [key: string]: any };
};

export interface ILayer {
  id?: string;
  title: string;
  type: string;
  view?: ViewLayer;
  source?: SourceLayer;
};

export interface LayerInstance extends Sequelize.Instance<ILayer> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  type: string;
  view?: ViewLayer;
  source?: SourceLayer;
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
    'source': {
      'type': DataTypes.TEXT,
      'get': function() {
        const source = this.getDataValue('source');
        return source ? JSON.parse(source) : {};
      },
      'set': function(val) {
        this.setDataValue('source', JSON.stringify(val));
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
