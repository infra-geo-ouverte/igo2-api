import * as Sequelize from 'sequelize';

export interface IBookmark {
  id?: string;
  userId?: string;
  title: string;
  x: number;
  y: number;
  zoom: number;
};

export interface BookmarkInstance extends Sequelize.Instance<IBookmark> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  userId: string;
  title: string;
  x: number;
  y: number;
  zoom: number;
}

export interface BookmarkModel
  extends Sequelize.Model<BookmarkInstance, IBookmark> { }


export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const bookmark = sequelize.define<BookmarkModel, IBookmark>('bookmark', {
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
  },
    {
      'indexes': [{
        'fields': ['userId']
      }],
      'tableName': 'bookmark',
      'timestamps': true
    });

    console.log(sequelize.models);

  const user = sequelize.models['user'];

  user.hasMany(bookmark, {
    foreignKey: {
      name: 'userId',
      allowNull: false
    }
  });

  bookmark.sync();

  return bookmark;
}
