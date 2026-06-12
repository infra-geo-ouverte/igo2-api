import {
  AnyPgColumnBuilder,
  PgBuildExtraConfigColumns,
  PgTableExtraConfigValue,
  pgEnum,
  snakeCase
} from 'drizzle-orm/pg-core';

const dbSchemaName = process.env.DB_SCHEMA ?? 'public';

export const appPgTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, AnyPgColumnBuilder>
>(
  name: TTableName,
  columns: TColumnsMap,
  extraConfig?: (
    self: PgBuildExtraConfigColumns<TColumnsMap>
  ) => PgTableExtraConfigValue[]
) => {
  return dbSchemaName === 'public'
    ? snakeCase.table(name, columns, extraConfig)
    : snakeCase.schema(dbSchemaName).table(name, columns, extraConfig);
};

export const appPgEnum = <U extends string, T extends Readonly<[U, ...U[]]>>(
  name: string,
  values: T
) => {
  return dbSchemaName === 'public'
    ? pgEnum(name, values)
    : snakeCase.schema(dbSchemaName).enum(name, values);
};
