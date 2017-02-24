import * as Sequelize from 'sequelize';

interface PropertiesToolContext {
  attribution: string;
  minZoom: number;
  maxZoom: number;
};

export interface IToolContext {
  properties: PropertiesToolContext;
};

export interface ToolContextInstance
  extends Sequelize.Instance<IToolContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  properties: PropertiesToolContext;
}

export interface ToolContextModel
  extends Sequelize.Model<ToolContextInstance, IToolContext> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const toolContext = sequelize.define<ToolContextModel, IToolContext>(
    'toolContext', {
      'id': {
        'type': DataTypes.INTEGER,
        'allowNull': false,
        'primaryKey': true,
        'autoIncrement': true
      },
      'properties': {
        'type': DataTypes.TEXT,
        'get': function() {
          return JSON.parse(this.getDataValue('properties'));
        },
        'set': function(val) {
          this.setDataValue('properties', JSON.stringify({}));
        }
      },
      context_id: {
        type: DataTypes.INTEGER
      },
      tool_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      'tableName': 'toolContext',
      'timestamps': true
    }
  );

  const tool = sequelize.models['tool'];
  const context = sequelize.models['context'];

  tool.belongsToMany(context, {
    through: {
      model: toolContext,
      unique: false
    },
    foreignKey: {
      name: 'tool_id',
      allowNull: false
    }
  });

  context.belongsToMany(tool, {
    through: {
      model: toolContext,
      unique: false
    },
    foreignKey: {
      name: 'context_id',
      allowNull: false
    }
  });

  toolContext.sync();

  return toolContext;
}
