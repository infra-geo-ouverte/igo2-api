import {
  Table, Column, Model, AllowNull, PrimaryKey, Index,
  AutoIncrement, DataType, AfterUpdate, AfterCreate, Default
} from 'sequelize-typescript';

import * as Configs from '../configurations';
import { IDatabaseConfiguration } from '../configurations';

import { ILayer } from './layer.interface';

@Table({
  tableName: 'layer',
  timestamps: true
})
export class Layer extends Model<ILayer> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
    id: number;

  @Default(true)
  @AllowNull(false)
  @Column
    enabled: boolean;

  @Index({ name: 'layer_type_url_layers', unique: true })
  @AllowNull(false)
  @Column({ type: DataType.STRING(16) })
    type: string;

  @Index({ name: 'layer_type_url_layers', unique: true })
  @Column
    url: string;

  @Index({ name: 'layer_type_url_layers', unique: true })
  @Column({ type: DataType.STRING(128) })
    layers: string;

  @Index({ unique: false })
  @Column
    global: boolean;

  @Column({ type: DataType.JSON })
    layerOptions: { [key: string]: any };

  @Column({ type: DataType.JSON })
    sourceOptions: { [key: string]: any };

  @Column({
    type: (Configs.getDatabaseConfig() as IDatabaseConfiguration).dialect === 'postgres' ? DataType.TSVECTOR : DataType.TEXT
  }) // only for postgresql
    searchableColumn: { [key: string]: any };

  @Column(DataType.STRING)
  get profils (): string[] {
    const profils: string = this.getDataValue('profils') as any;
    return profils ? profils.split(',') : [];
  }

  set profils (value: string[]) {
    const profils: any = value.join(',');
    this.setDataValue('profils', profils);
  }

  @AfterUpdate
  @AfterCreate
  static updateSearchableColumn (layer: Layer) {
    // this will be called when an instance is created or updated
    let sql = 'UPDATE layer SET "searchableColumn" =\'NA\'';
    if ((Configs.getDatabaseConfig() as IDatabaseConfiguration).dialect === 'postgres') {
      sql = ` 
      UPDATE layer SET "searchableColumn" = to_tsvector('simple', ${['coalesce(layers,\'\')', 'coalesce("layerOptions"->\'title\',\'{}\')'].join(" || ' ' || ")});
      `;
    }
    layer.sequelize.query(sql);
  }
}
