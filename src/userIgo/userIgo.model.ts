import {
  Table, Column, Model, AllowNull, PrimaryKey, Index, ForeignKey,
  AutoIncrement, DataType
} from 'sequelize-typescript';

import { User } from '../user/user.model';
import { IUserIgo } from './userIgo.interface';

@Table({
  tableName: 'user_igo',
  timestamps: true
})
export class UserIgo extends Model<IUserIgo> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @Column
    defaultContextId: number;

  @Column({ type: DataType.JSON })
    preference: { [key: string]: any };

  @Index
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({ type: DataType.TEXT })
    userId: string;

  @Column(DataType.TEXT)
  get profils (): string[] {
    const profils: string = this.getDataValue('profils') as any;
    return profils ? profils.split(',') : [];
  }

  set profils (value: string[]) {
    const profils: any = value.join(',');
    this.setDataValue('profils', profils);
  }
}
