import * as Sequelize from 'sequelize';

export interface ICatalog {
  id?: string;
  title: string;
  url: string;
};

export interface CatalogInstance extends Sequelize.Instance<ICatalog> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  url: string;
}

export interface CatalogModel
  extends Sequelize.Model<CatalogInstance, ICatalog> { }


export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const catalog = sequelize.define<CatalogModel, ICatalog>('catalog', {
    'id': {
      'type': DataTypes.INTEGER,
      'allowNull': false,
      'primaryKey': true,
      'autoIncrement': true
    },
    'title': {
      'type': DataTypes.STRING(64),
      'allowNull': false
    },
    'url': {
      'type': DataTypes.STRING(128),
      'allowNull': false
    }
  }, {
    'tableName': 'catalog',
    'timestamps': true
  });

  catalog.sync();

  return catalog;
}
