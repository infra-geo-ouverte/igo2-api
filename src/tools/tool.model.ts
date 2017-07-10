import * as Sequelize from 'sequelize';

export interface ITool {
  name: string;
  title?: string;
  icon?: string;
  url?: string;
  protected: boolean;
  inToolbar?: boolean;
  options?: { [key: string]: any };
};

export interface ToolInstance extends Sequelize.Instance<ITool> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  title?: string;
  icon?: string;
  url?: string;
  protected: boolean;
  inToolbar?: boolean;
  options?: { [key: string]: any };
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
      'type': DataTypes.STRING(64),
      'allowNull': false
    },
    'title': {
      'type': DataTypes.STRING(64)
    },
    'icon': {
      'type': DataTypes.STRING(128)
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
    'inToolbar': {
      'type': DataTypes.BOOLEAN
    },
    'options': {
      'type': DataTypes.TEXT,
      'get': function() {
        const options = this.getDataValue('options');
        return options ? JSON.parse(options) : {};
      },
      'set': function(val) {
        this.setDataValue('options', JSON.stringify(val));
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
