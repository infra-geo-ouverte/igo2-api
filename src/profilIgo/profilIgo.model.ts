import * as Sequelize from 'sequelize';

export interface IProfilIgo {
  name: string;
  title: string;
}

export interface ProfilIgoInstance extends Sequelize.Instance<IProfilIgo> {
  name: string;
  title: string;
}

export interface ProfilIgoModel extends Sequelize.Model<ProfilIgoInstance, IProfilIgo> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const profilIgo = sequelize.define<ProfilIgoModel, IProfilIgo>(
    'profilIgo',
    {
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
        primaryKey: true
      }
    },
    {
      tableName: 'profil_igo',
      timestamps: false
    }
  );

  profilIgo.sync();

  return profilIgo;
}
