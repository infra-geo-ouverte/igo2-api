import * as Sequelize from 'sequelize';

enum Scope {
    public,
    protected,
    private
}

interface Map {
  view: {
    center: string;
    zoom: number;
  };
};

export interface IContext  {
    uri: string;
    scope: Scope;
    title: string;
    icon: string;
    map: Map;
};

export interface ContextInstance extends Sequelize.Instance<IContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  uri: string;
  scope: Scope;
  title: string;
  icon: string;
  map: string;
}

export interface ContextModel
       extends Sequelize.Model<ContextInstance, IContext> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
    const context = sequelize.define<ContextModel, IContext>('context', {
        'id': {
            'type': DataTypes.INTEGER,
            'allowNull': false,
            'primaryKey': true,
            'autoIncrement': true
        },
        'uri': {
            'type': DataTypes.STRING(64),
            'allowNull': false
        },
        'title': {
            'type': DataTypes.STRING(128),
            'allowNull': false
        },
        'icon': {
            'type': DataTypes.STRING(128)
        },
        'scope': {
            'type': DataTypes.ENUM('public', 'protected', 'private'),
            'allowNull': false
            /*'unique': true,
            'validate': {
                'isEmail': true
            }*/
        },
        'map': {
            'type': DataTypes.TEXT,
            'get': function() {
                return JSON.parse(this.getDataValue('map'));
            },
            'set': function(val) {
                this.setDataValue('map', JSON.stringify({}));
            }
        }
    },
    {
        'tableName': 'context',
        'timestamps': true
    });

    context.sync();

    return context;
}
