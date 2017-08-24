import * as Sequelize from 'sequelize';

import { TypePermission } from '../contextPermission';

export enum Scope {
  public,
  protected,
  private
}

interface Map {
  view: {
    center: [number, number];
    zoom: number;
    projection: string;
  };
};

export interface IContext {
  id?: string;
  uri: string;
  scope: Scope;
  title: string;
  icon: string;
  map: Map;
  owner: string;
  permission?: TypePermission | string;
};

export interface ContextInstance extends Sequelize.Instance<IContext> {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  uri: string;
  scope: Scope;
  title: string;
  icon: string;
  map: string;
  owner: string;
  permission?: TypePermission | string;
}

export interface ContextModel
  extends Sequelize.Model<ContextInstance, IContext> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
  const context = sequelize.define<ContextModel, IContext>('context', {
    'id': {
      'type': DataTypes.INTEGER,
      'allowNull': false,
      'primaryKey': true,
      'autoIncrement': true
    },
    'uri': {
      'type': DataTypes.STRING(64),
      'allowNull': false
    },
    'title': {
      'type': DataTypes.STRING(128),
      'allowNull': false
    },
    'icon': {
      'type': DataTypes.STRING(128)
    },
    'owner': {
      'type': DataTypes.STRING(128),
      'allowNull': false
    },
    'scope': {
      'type': DataTypes.ENUM('public', 'protected', 'private'),
      'allowNull': false
    },
    'map': {
      'type': DataTypes.TEXT,
      'get': function() {
        const map = this.getDataValue('map');
        return map ? JSON.parse(map) : {};
      },
      'set': function(val) {
        this.setDataValue('map', JSON.stringify(val));
      }
    }
  },
    {
      'indexes': [{
        'fields': ['scope']
      }, {
        'fields': ['owner']
      }],
      'tableName': 'context',
      'timestamps': true
    });

  context.sync();

  return context;
}
