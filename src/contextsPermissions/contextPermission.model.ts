import * as Sequelize from 'sequelize';

export enum TypePermission {
  null,
  read,
  write
}

export interface IContextPermission {
  typePermission: TypePermission;
  profil: string;
  contextId: string;
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
        'contextId': {
          'type': DataTypes.INTEGER
        }
      },
      {
        'indexes': [{
          'unique': true,
          'fields': ['contextId', 'profil']
        }, {
          'fields': ['contextId']
        }, {
          'fields': ['profil']
        }],
        'tableName': 'contextPermission',
        'timestamps': true
      }
    );

  const context = sequelize.models['context'];

  context.hasMany(contextPermission, {
    foreignKey: {
      name: 'contextId',
      allowNull: false
    }
  });

  contextPermission.sync();

  return contextPermission;
}
