import { Table, Column, Model, AllowNull, PrimaryKey, DataType } from 'sequelize-typescript';

import { IProfilIgo } from './profilIgo.interface';

@Table({
  tableName: 'profil_igo',
  timestamps: false
})
export class ProfilIgo extends Model<IProfilIgo> {
  @PrimaryKey
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(128) })
  name: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(128) })
  title: string;

  @Column({ type: DataType.STRING(128) })
  group: string;

  @Column({ type: DataType.JSON })
  preference: { [key: string]: any };

  @Column
  canShare: boolean;

  @Column(DataType.STRING)
  get canShareToProfils (): number[] {
    const canShareToProfils: string = this.getDataValue('canShareToProfils') as any;
    return canShareToProfils ? canShareToProfils.split(',').map(p => Number(p)) : [];
  }

  set canShareToProfils (value: number[]) {
    const canShareToProfils: any = value.join(',');
    this.setDataValue('canShareToProfils', canShareToProfils);
  }

  @Column
  canFilter: boolean;

  @Column
  guide: string;
}
