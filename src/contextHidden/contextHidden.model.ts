import { Table, Column, Model, AllowNull, PrimaryKey, Index, AutoIncrement, ForeignKey } from 'sequelize-typescript';

import { IContextHidden } from './contextHidden.interface';
import { Context } from '../context/context.model';

@Table({
  tableName: 'context_hidden',
  timestamps: true
})
export class ContextHidden extends Model<IContextHidden> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  id: number;

  @Index({ name: 'context_hidden_contextId_user', unique: true })
  @Index
  @AllowNull(false)
  @Column
  user: string;

  @Index({ name: 'context_hidden_contextId_user', unique: true })
  @Index
  @ForeignKey(() => Context)
  @AllowNull(false)
  @Column
  contextId: number;
}
