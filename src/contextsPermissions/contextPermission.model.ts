import * as Sequelize from 'sequelize';

enum TypePermission {
  read,
  write
}

export interface IContextPermission {
  typePermission: TypePermission;
  profil: string;
};

export interface ContextPermissionInstance
  extends Sequelize.Instance<IContextPermission> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  profil: string;
  typePermission: TypePermission;
}

export interface ContextPermissionModel
  extends Sequelize.Model<ContextPermissionInstance, IContextPermission> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const contextPermission =
    sequelize.define<ContextPermissionModel, IContextPermission>(
      'contextPermission', {
        'id': {
          'type': DataTypes.INTEGER,
          'allowNull': false,
          'primaryKey': true,
          'autoIncrement': true
        },
        'typePermission': {
          'type': DataTypes.ENUM('read', 'write'),
          'allowNull': false
        },
        'profil': {
          'type': DataTypes.STRING,
          'allowNull': false
        },
        'context_id': {
          'type': DataTypes.INTEGER
        }
      },
      {
        'tableName': 'contextPermission',
        'timestamps': true
      }
    );

  const context = sequelize.models['context'];

  context.hasMany(contextPermission, {
    foreignKey: {
      name: 'context_id',
      allowNull: false
    }
  });

  contextPermission.sync();

  return contextPermission;
}
