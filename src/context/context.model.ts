import {
  Table,
  Column,
  Model,
  AllowNull,
  PrimaryKey,
  Index,
  AutoIncrement,
  DataType,
  Unique,
  BelongsToMany,
  HasMany
} from 'sequelize-typescript';

import { Layer } from '../layer';
import { LayerContext } from '../layerContext';

import { Tool } from '../tool';
import { ToolContext } from '../toolContext';

import { ContextPermission } from '../contextPermission';
import { ContextHidden } from '../contextHidden';

import { IContext } from './context.interface';

@Table({
  tableName: 'context',
  timestamps: true
})
export class Context extends Model<IContext> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @AllowNull(false)
  @Unique
  @Column({ type: DataType.TEXT })
    uri: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(128) })
    title: string;

  @Column({ type: DataType.STRING(128) })
    icon: string;

  @Index
  @AllowNull(false)
  @Column({ type: DataType.STRING(128) })
    owner: string;

  @Index
  @AllowNull(false)
  @Column({ type: DataType.ENUM('public', 'protected', 'private') })
    scope: string;

  @Column({ type: DataType.JSON })
    map: { [key: string]: any };

  @BelongsToMany(() => Layer, () => LayerContext)
    layers: Layer[];

  @BelongsToMany(() => Tool, () => ToolContext)
    tools: Tool[];

  @HasMany(() => ContextPermission)
    contextPermissions: ContextPermission[];

  @HasMany(() => ContextHidden)
    contextHiddens: ContextHidden[];
}
