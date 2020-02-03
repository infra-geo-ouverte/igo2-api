import * as Sequelize from 'sequelize';

export interface IContextAccess {
  id?: string;
  contextId: string;
  calls: number;
}

export interface ContextAccessInstance
  extends Sequelize.Instance<IContextAccess> {
  id?: string;
  calls: number;
  createdAt: Date;
  accessedAt: Date;

  contextId: string;
}

export interface ContextAccessModel
  extends Sequelize.Model<ContextAccessInstance, IContextAccess> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const contextAccess = sequelize.define<
    ContextAccessModel,
    IContextAccess
  >(
    'contextAccess',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      contextId: {
        type: DataTypes.INTEGER
      },
      calls: {
        type: DataTypes.INTEGER
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['contextId']
        },
      ],
      tableName: 'context_access',
      timestamps: true,
      updatedAt: 'accessedAt'
    }
  );

  const context = sequelize.models['context'];

  context.hasMany(contextAccess, {
    foreignKey: {
      name: 'contextId',
      allowNull: false
    }
  });

  contextAccess.sync();

  return contextAccess;
}
