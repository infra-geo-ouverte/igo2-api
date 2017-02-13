import * as Sequelize from 'sequelize';

/*enum Scope {
    public,
    protected,
    private
}*/

export interface IContext  {
    alias?: string;
    scope: string;
};

export interface ContextInstance extends Sequelize.Instance<IContext> {
  id: string;
  updatedAt: Date;

  alias: string;
  scope: string;
}

export interface ContextModel
       extends Sequelize.Model<ContextInstance, IContext> { }

export default function define(sequelize: Sequelize.Sequelize, DataTypes) {
    const context = sequelize.define<ContextModel, IContext>('context', {
        'id': {
            'type': DataTypes.UUID,
            'allowNull': false,
            'primaryKey': true
        },
        'alias': {
            'type': DataTypes.STRING(128),
            'allowNull': false
        },
        'scope': {
            'type': DataTypes.STRING(128),
            'allowNull': false
            /*'unique': true,
            'validate': {
                'isEmail': true
            }*/
        }
    },
    {
        'tableName': 'context',
        'timestamps': true,
        'updatedAt': 'updated_at',
    });

    context.sync();

    return context;
}
