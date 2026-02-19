import { poiModel } from './poi.model';

export type IPoi = typeof poiModel.$inferSelect;
export type IPoiIn = typeof poiModel.$inferInsert;
