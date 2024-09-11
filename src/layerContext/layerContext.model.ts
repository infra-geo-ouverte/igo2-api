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

import { ILayerContext } from './layerContext.interface';
import { Context } from '../context/context.model';
import { Layer } from '../layer/layer.model';

@Table({
  tableName: 'layer_context',
  timestamps: true
})
export class LayerContext extends Model<ILayerContext> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  id: number;

  @Column({ type: DataType.JSON })
  layerOptions: { [key: string]: any };

  @Column({ type: DataType.JSON })
  sourceOptions: { [key: string]: any };

  @Index({ name: 'layer_context_contextId_layerId', unique: true })
  @Index
  @ForeignKey(() => Context)
  @AllowNull(false)
  @Column
  contextId: number;

  @Index({ name: 'layer_context_contextId_layerId', unique: true })
  @Index
  @ForeignKey(() => Layer)
  @AllowNull(true)
  @Column
  layerId?: number;
}
