import {
  Table, Column, Model, AllowNull, PrimaryKey, Index, ForeignKey,
  AutoIncrement, DataType
} from 'sequelize-typescript';

import { User } from '../user/user.model';
import { IPoi } from './poi.interface';

@Table({
  tableName: 'poi',
  timestamps: true
})
export class Poi extends Model<IPoi> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(64) })
    title: number;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL })
    x: number;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL })
    y: number;

  @AllowNull(false)
  @Column
    zoom: number;

  @Index
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.TEXT })
    userId: string;
}
