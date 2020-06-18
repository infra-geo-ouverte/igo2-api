import * as Sequelize from 'sequelize';

export interface IContextHidden {
  user: string;
  contextId: string;
}

export interface ContextHiddenInstance extends Sequelize.Instance<IContextHidden> {
  createdAt: Date;
  updatedAt: Date;

  user: string;
  contextId: string;
}

export interface ContextHiddenModel extends Sequelize.Model<ContextHiddenInstance, IContextHidden> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const contextHidden = sequelize.define<ContextHiddenModel, IContextHidden>(
    'contextHidden',
    {
      user: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contextId: {
        type: DataTypes.INTEGER
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['contextId', 'user']
        },
        {
          fields: ['contextId']
        },
        {
          fields: ['user']
        }
      ],
      tableName: 'context_hidden',
      timestamps: true
    }
  );

  const context = sequelize.models['context'];

  context.hasMany(contextHidden, {
    foreignKey: {
      name: 'contextId',
      allowNull: false
    }
  });

  contextHidden.sync();

  return contextHidden;
}
