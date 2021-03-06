import * as Sequelize from 'sequelize';
// import * as Bcrypt from "bcryptjs";

export interface IUser {
  id?: string;
  source: string;
  sourceId: string;
  email?: string;
  defaultContextId?: string;
};

export interface UserInstance extends Sequelize.Instance<IUser> {
  id: string;
  source: string;
  sourceId: string;
  email?: string;
  defaultContextId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel
       extends Sequelize.Model<UserInstance, IUser> { }


export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
    const user = sequelize.define<UserModel, IUser>('user', {
        'id': {
            'type': DataTypes.INTEGER,
            'allowNull': false,
            'primaryKey': true,
            'autoIncrement': true
        },
        'source': {
            'type': DataTypes.STRING(64),
            'allowNull': false
        },
        'sourceId': {
            'type': DataTypes.STRING(64),
            'allowNull': false
        },
        'email': {
            'type': DataTypes.STRING(128),
            'allowNull': true,
            'unique': true
        }
    },
    {
        'tableName': 'user',
        'timestamps': true
    });

    const context = sequelize.models['context'];

    user.belongsTo(context, {foreignKey: 'defaultContextId'});

    user.sync();

    return user;
}
