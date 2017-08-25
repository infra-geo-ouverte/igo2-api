import * as Sequelize from 'sequelize';

export interface IPOI {
  id?: string;
  userId?: string;
  title: string;
  x: number;
  y: number;
  zoom: number;
};

export interface POIInstance extends Sequelize.Instance<IPOI> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  userId: string;
  title: string;
  x: number;
  y: number;
  zoom: number;
}

export interface POIModel
  extends Sequelize.Model<POIInstance, IPOI> { }


export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const poi = sequelize.define<POIModel, IPOI>('poi', {
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
    'x': {
      'type': DataTypes.DECIMAL,
      'allowNull': false
    },
    'y': {
      'type': DataTypes.DECIMAL,
      'allowNull': false
    },
    'zoom': {
      'type': DataTypes.INTEGER(2),
      'allowNull': false
    }
  }, {
    'indexes': [{
      'fields': ['userId']
    }],
    'tableName': 'poi',
    'timestamps': true
  });

  const user = sequelize.models['user'];

  user.hasMany(poi, {
    foreignKey: {
      name: 'userId',
      allowNull: false
    }
  });

  poi.sync();

  return poi;
}
