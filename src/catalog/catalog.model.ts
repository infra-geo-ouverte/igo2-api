import { Table, Column, Model, AllowNull, PrimaryKey, AutoIncrement, DataType } from 'sequelize-typescript';
import { ICatalog } from './catalog.interface';

@Table({
  tableName: 'catalog',
  timestamps: true
})
export class Catalog extends Model<ICatalog> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(64) })
  title: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(128) })
  url: string;

  @Column({ type: DataType.JSON })
  options: { [key: string]: any };

  @Column
  order: number;

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
