import {
  Table, Column, Model, AllowNull, PrimaryKey, Unique,
  AutoIncrement, DataType
} from 'sequelize-typescript';
import { ITool } from './tool.interface';

@Table({
  tableName: 'tool',
  timestamps: true
})
export class Tool extends Model<ITool> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  id: number;

  @Unique
  @AllowNull(true)
  @Column({ type: DataType.STRING(64) })
  name: string;

  @Column({ type: DataType.STRING(64) })
  title: string;

  @Column({ type: DataType.STRING(128) })
  tooltip: string;

  @Column({ type: DataType.STRING(128) })
  icon: string;

  @Column
  inToolbar: boolean;

  @Column
  global: boolean;

  @Column
  order: number;

  @Column({ type: DataType.JSON })
  options: { [key: string]: any };

  @Column(DataType.STRING)
  get profils (): string[] {
    const profils: string = this.getDataValue('profils') as any;
    return profils ? profils.split(',') : [];
  }

  set profils (value: string[]) {
    const profils: any = value.join(',');
    this.setDataValue('profils', profils);
  }
}
