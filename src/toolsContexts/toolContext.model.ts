import * as Sequelize from 'sequelize';

export interface IToolContext {
  options?: {[key: string]: any};
};

export interface ToolContextInstance
  extends Sequelize.Instance<IToolContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  options?: {[key: string]: any};
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
      'options': {
        'type': DataTypes.TEXT,
        'get': function() {
          const options = this.getDataValue('options');
          return options ? JSON.parse(options) : {};
        },
        'set': function(val) {
          this.setDataValue('options', JSON.stringify(val));
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
