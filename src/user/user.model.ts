import {
  Table, Column, Model, AllowNull, PrimaryKey, UpdatedAt, DataType
} from 'sequelize-typescript';
import { IUser } from './user.interface';

@Table({
  tableName: 'user',
  timestamps: true,
  updatedAt: 'loginAt'
})
export class User extends Model<IUser> {
  @PrimaryKey
  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  id: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(64) })
  source: string;

  @Column({ type: DataType.STRING(64) })
  sourceId: string;

  @Column({ type: DataType.STRING(64) })
  firstName: string;

  @Column({ type: DataType.STRING(64) })
  lastName: string;

  @Column({ type: DataType.STRING(128) })
  email: string;

  @UpdatedAt
  loginAt: Date;
}
