import {
  Table,
  Column,
  Model,
  AllowNull,
  PrimaryKey,
  Index,
  AutoIncrement,
  DataType,
  ForeignKey
} from 'sequelize-typescript';

import { IToolContext } from './toolContext.interface';
import { Context } from '../context/context.model';
import { Tool } from '../tool/tool.model';

@Table({
  tableName: 'tool_context',
  timestamps: true
})
export class ToolContext extends Model<IToolContext> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @Column({ type: DataType.JSON })
    options: { [key: string]: any };

  @Column
    enabled: boolean;

  @Column
    order: number;

  @Index({ name: 'tool_context_contextId_toolId', unique: true })
  @Index
  @ForeignKey(() => Context)
  @AllowNull(false)
  @Column
    contextId: number;

  @Index({ name: 'tool_context_contextId_toolId', unique: true })
  @Index
  @ForeignKey(() => Tool)
  @AllowNull(false)
  @Column
    toolId: number;
}
