import { Table, Column, Model, AllowNull, PrimaryKey, Index,
   AutoIncrement, DataType } from 'sequelize-typescript';

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

  @Index({name: 'layer_type_url_layers', unique: true})
  @AllowNull(false)
  @Column({type: DataType.STRING(16)})
  type: string;

  @Index({name: 'layer_type_url_layers', unique: true})
  @Column
  url: string;

  @Index({name: 'layer_type_url_layers', unique: true})
  @Column({type: DataType.STRING(128)})
  layers: string;

  @Index({unique: false})
  @Column
  global: boolean;

  @Column({type: DataType.JSON})
  layerOptions: { [key: string]: any };

  @Column({type: DataType.JSON})
  sourceOptions: { [key: string]: any };
}
