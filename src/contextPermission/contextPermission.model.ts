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

import { IContextPermission } from './contextPermission.interface';
import { Context } from '../context/context.model';

@Table({
  tableName: 'context_permission',
  timestamps: true
})
export class ContextPermission extends Model<IContextPermission> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @AllowNull(false)
  @Column({ type: DataType.ENUM('read', 'write') })
    typePermission: string;

  @Index({ name: 'context_permission_contextId_profil', unique: true })
  @Index
  @AllowNull(false)
  @Column
    profil: string;

  @Index({ name: 'context_permission_contextId_profil', unique: true })
  @Index
  @ForeignKey(() => Context)
  @AllowNull(false)
  @Column
    contextId: number;
}
