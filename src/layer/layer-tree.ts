import { TREE_SEPERATOR } from '../utils/tree/tree.utils';
import { Tree } from '../utils/tree/tree';
import { AnyLayerOptions } from './layer.interface';
import { isLayerGroupOptions } from './layer.utils';

/**
 * The LayerTree allows you to rebuild the layer hierarchy based on it's parentId
 * The Layer parentId property is stored with all parent identifiers ex: '1.2.3'
 * this indicates that the layer is inside group 3 which is in 2 and which is 1
 */
export class LayerTree<T extends AnyLayerOptions> extends Tree<T> {
  constructor(data?: T[]) {
    super(data);
  }

  getAncestorId = (node: T) => node.parentId?.split(TREE_SEPERATOR).pop();
  getChildren = (node: T) => {
    if (!isLayerGroupOptions(node)) {
      return undefined;
    }
    return node.children as T[];
  };
  getId = (node: T) => String(node.id);
  getLevel = (node: T) => node.parentId?.split(TREE_SEPERATOR).length ?? 0;
  isAncestor = (node: T) => node.type === 'group';
  setChildren = (node: T & { id: string }, value: T[]) => (node['children'] = value);
}
