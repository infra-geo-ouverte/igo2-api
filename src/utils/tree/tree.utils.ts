export const TREE_SEPERATOR = '.';

export function getAncestorId(
  id: string | number,
  ancestorId?: string | number
): string {
  return ancestorId ? ancestorId + TREE_SEPERATOR + id : id.toString();
}
