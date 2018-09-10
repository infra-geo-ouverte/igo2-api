import * as Sequelize from 'sequelize';

export interface ICatalogOptions {
  regFilters: string[];
}

export interface ICatalog {
  id?: string;
  title: string;
  url: string;
  options?: ICatalogOptions;
}

export interface CatalogInstance extends Sequelize.Instance<ICatalog> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  url: string;
  options: ICatalogOptions;
}

export interface CatalogModel
  extends Sequelize.Model<CatalogInstance, ICatalog> {}

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const catalog = sequelize.define<CatalogModel, ICatalog>(
    'catalog',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      url: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      options: {
        type: DataTypes.TEXT,
        get: function() {
          const options = this.getDataValue('options');
          return options ? JSON.parse(options) : {};
        },
        set: function(val) {
          this.setDataValue('options', JSON.stringify(val));
        }
      }
    },
    {
      tableName: 'catalog',
      timestamps: true
    }
  );

  catalog.sync();

  return catalog;
}
