import * as Sequelize from 'sequelize';

interface PropertiesTool {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

export interface ITool  {
    name: string;
    url: string;
    protected: boolean;
    properties: PropertiesTool;
};

export interface ToolInstance extends Sequelize.Instance<ITool> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  url: string;
  protected: boolean;
  properties: PropertiesTool;
}

export interface ToolModel
       extends Sequelize.Model<ToolInstance, ITool> { }


export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
    const tool = sequelize.define<ToolModel, ITool>('tool', {
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
        'tableName': 'tool',
        'timestamps': true
    });

    tool.sync();

    return tool;
}
