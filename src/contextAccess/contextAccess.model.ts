import {
  Table,
  Column,
  Model,
  AllowNull,
  PrimaryKey,
  Index,
  AutoIncrement,
  UpdatedAt,
  ForeignKey
} from 'sequelize-typescript';

import { IContextAccess } from './contextAccess.interface';
import { Context } from '../context/context.model';

@Table({
  tableName: 'context_access',
  timestamps: true,
  updatedAt: 'accessedAt'
})
export class ContextAccess extends Model<IContextAccess> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @Index
  @ForeignKey(() => Context)
  @AllowNull(false)
  @Column
    contextId: number;

  @Column
    calls: number;

  @UpdatedAt
    accessedAt: Date;
}
