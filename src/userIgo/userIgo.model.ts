import * as Sequelize from 'sequelize';

export interface IUserIgo {
  id?: string;
  userId?: string;
  defaultContextId: string;
}

export interface UserIgoInstance extends Sequelize.Instance<IUserIgo> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  userId: string;
  defaultContextId: string;
}

export interface UserIgoModel
  extends Sequelize.Model<UserIgoInstance, IUserIgo> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const userIgo = sequelize.define<UserIgoModel, IUserIgo>(
    'userIgo',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      defaultContextId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      indexes: [
        {
          fields: ['userId']
        }
      ],
      tableName: 'user_igo',
      timestamps: true
    }
  );

  const user = sequelize.models['user'];
  // const context = sequelize.models['context'];

  user.hasOne(userIgo, {
    foreignKey: {
      name: 'userId',
      allowNull: false
    }
  });

  // context.belongsToMany(user, {
  //   through: {
  //     model: userIgo,
  //     unique: false
  //   },
  //   foreignKey: {
  //     name: 'defaultContextId',
  //     allowNull: false
  //   }
  // });

  userIgo.sync();

  return userIgo;
}
