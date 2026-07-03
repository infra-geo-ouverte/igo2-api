import Type, { Static, TSchema } from 'typebox';

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Unsafe<Static<T> | null>({
    ...schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: [(schema as any).type, 'null'] // Combines types into an array: ['number', 'null']
  });
