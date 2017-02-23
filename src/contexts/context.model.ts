import * as Sequelize from 'sequelize';

enum Scope {
    public,
    protected,
    private
}

interface PropertiesMap {
  center: string;
  zoom: number;
};

export interface IContext  {
    alias: string;
    scope: Scope;
    properties_map: PropertiesMap;
};

export interface ContextInstance extends Sequelize.Instance<IContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  alias: string;
  scope: Scope;
  properties_map: string;
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
        'alias': {
            'type': DataTypes.STRING(64)
        },
        'scope': {
            'type': DataTypes.ENUM('public', 'protected', 'private'),
            'allowNull': false
            /*'unique': true,
            'validate': {
                'isEmail': true
            }*/
        },
        'properties_map': {
            'type': DataTypes.TEXT,
            'get': function() {
                return JSON.parse(this.getDataValue('properties_map'));
            },
            'set': function(val) {
                this.setDataValue('properties_map', JSON.stringify({}));
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
