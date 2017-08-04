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
      contextId: {
        type: DataTypes.INTEGER
      },
      toolId: {
        type: DataTypes.INTEGER
      }
    },
    {
      'indexes': [{
        'unique': true,
        'fields': ['contextId', 'toolId']
      }, {
        'fields': ['contextId']
      }, {
        'fields': ['toolId']
      }],
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
      name: 'toolId',
      allowNull: false
    }
  });

  context.belongsToMany(tool, {
    through: {
      model: toolContext,
      unique: false
    },
    foreignKey: {
      name: 'contextId',
      allowNull: false
    }
  });

  toolContext.sync();

  return toolContext;
}
