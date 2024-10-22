export const TREE_SEPERATOR = '.';

export function getAncestorId(id: string, ancestorId?: string): string {
  return ancestorId ? ancestorId + TREE_SEPERATOR + id : id;
}
