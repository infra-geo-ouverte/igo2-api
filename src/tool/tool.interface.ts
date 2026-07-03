import { toolModel } from './tool.model';

export type ITool = typeof toolModel.$inferSelect;

export type IToolIn = typeof toolModel.$inferInsert;

export type IToolOptions = Record<string, unknown>;
