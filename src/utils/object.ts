// Define a type for simple objects, excluding Arrays and null
type NonArrayObject<T> = T extends unknown[]
  ? never // Exclude Arrays
  : T extends object
    ? T
    : never;

export type KeyPath<T> =
  T extends NonArrayObject<T>
    ? {
        [K in keyof T]-?: K extends string
          ? T[K] extends NonArrayObject<T[K]> // Check for nested object
            ? K | `${K}.${KeyPath<T[K]>}` // Include key and recurse
            : K // Base case: only include key
          : never;
      }[keyof T]
    : never;

/**
 * Removes multiple keys from an object based on a list of dot-separated paths.
 * * @param obj The source object to filter.
 * @param keysToExclude The array of dot-separated string paths (e.g., ['params.layers', 'type']).
 * @returns A new object with the specified nested keys removed.
 */
export function excludeKeys<T extends object>(
  obj: T,
  keysToExclude: KeyPath<T>[]
): T {
  const newObject: T = JSON.parse(JSON.stringify(obj));

  for (const path of keysToExclude) {
    if (!path) continue;

    const keys = path.split('.');
    const keyToDelete = keys.pop() as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = newObject;
    let pathFound = true;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        pathFound = false;
        break;
      }
    }

    if (
      pathFound &&
      current &&
      typeof current === 'object' &&
      keyToDelete in current
    ) {
      delete current[keyToDelete];
    }
  }

  return newObject;
}
